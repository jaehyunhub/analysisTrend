import logging
from collections import Counter
from datetime import datetime, timedelta, timezone
from typing import Any, Optional
from urllib.parse import urlparse, parse_qs
import httpx
from config import settings
from models.trend import TrendingVideo, TrendKeyword, ChannelStats

logger = logging.getLogger(__name__)

YOUTUBE_TRENDING_URL = "https://www.googleapis.com/youtube/v3/videos"

def _iso(days_ago: float) -> str:
    """현재 시각에서 days_ago일 전 ISO 8601 문자열 반환."""
    dt = datetime.now(timezone.utc) - timedelta(days=days_ago)
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")

# 일일(≤1일): 0~5번, 일주일(≤7일): 6~11번, 한달(≤31일): 12~19번
_DAYS_AGO = [0.2, 0.5, 0.8, 0.9, 1.0, 0.3,
             2, 3, 4, 5, 6, 7,
             10, 14, 18, 22, 25, 28, 30, 31]

def _build_mock_videos() -> list[TrendingVideo]:
    return [
        TrendingVideo(
            video_id=f"mock_{i}",
            title=f"[급상승] 트렌드 영상 {i + 1} | 채널분석 인사이트",
            channel_title=f"채널{i + 1}",
            view_count=max(0, (20 - i)) * 1_000_000,
            like_count=max(0, (20 - i)) * 50_000,
            comment_count=max(0, (20 - i)) * 2_000,
            published_at=_iso(_DAYS_AGO[i]),
            thumbnail_url=f"https://picsum.photos/seed/{i + 1}/320/180",
            tags=["트렌드", "AI", "유튜브", f"키워드{i + 1}"],
        )
        for i in range(20)
    ]


class YouTubeCollector:
    """YouTube Data API v3를 통해 트렌딩 동영상을 수집합니다."""

    def __init__(self) -> None:
        self._api_key = settings.youtube_api_key

    async def fetch_trending(
        self,
        region_code: str = "KR",
        category_id: str = "0",
        limit: int = 20,
    ) -> list[TrendingVideo]:
        if not self._api_key:
            logger.info("YouTube API 키 없음 — mock 데이터 반환")
            return _build_mock_videos()[:limit]

        try:
            items = await self._call_api(
                YOUTUBE_TRENDING_URL,
                {
                    "part": "snippet,statistics",
                    "chart": "mostPopular",
                    "regionCode": region_code,
                    "videoCategoryId": category_id,
                    "maxResults": limit,
                    "key": self._api_key,
                },
            )
            return [self._parse_video(item) for item in items if item]
        except Exception as e:
            logger.warning("YouTubeCollector.fetch_trending 실패, mock fallback: %s", e)
            return _build_mock_videos()[:limit]

    async def fetch_keywords(self, limit: int = 20) -> list[TrendKeyword]:
        videos = await self.fetch_trending(limit=50)
        counter: Counter = Counter()
        for v in videos:
            for token in v.title.split():
                if len(token) >= 2:
                    counter[token] += 1
            for tag in v.tags:
                if len(tag) >= 2:
                    counter[tag] += 1

        total = sum(counter.values()) or 1
        return [
            TrendKeyword(
                keyword=kw,
                score=round(count / total, 4),
                source="youtube",
                rank=i + 1,
            )
            for i, (kw, count) in enumerate(counter.most_common(limit))
        ]

    async def fetch_channel_stats(self, channel_input: str) -> Optional[ChannelStats]:
        """채널 URL, 핸들(@채널명), 또는 채널 ID로 YouTube 채널 통계를 조회합니다."""
        if not self._api_key:
            logger.info("YouTube API 키 없음 — mock 채널 통계 반환")
            return self._mock_channel_stats(channel_input)

        channel_id = self._extract_channel_id(channel_input)
        handle = None

        # ID가 UC로 시작하는 채널 ID인지 확인
        if channel_id and channel_id.startswith("UC"):
            params: dict[str, Any] = {"part": "snippet,statistics", "id": channel_id, "key": self._api_key}
        elif channel_input.startswith("@"):
            handle = channel_input
            params = {"part": "snippet,statistics", "forHandle": handle, "key": self._api_key}
        else:
            # URL에서 핸들 추출 시도
            handle = self._extract_handle_from_url(channel_input)
            if handle:
                params = {"part": "snippet,statistics", "forHandle": handle, "key": self._api_key}
            elif channel_id:
                params = {"part": "snippet,statistics", "id": channel_id, "key": self._api_key}
            else:
                return None

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get("https://www.googleapis.com/youtube/v3/channels", params=params)
                resp.raise_for_status()
                items = resp.json().get("items", [])
                if not items:
                    return None
                return self._parse_channel(items[0])
        except Exception as e:
            logger.warning("fetch_channel_stats 실패: %s", e)
            return None

    def _extract_channel_id(self, text: str) -> Optional[str]:
        """URL 또는 텍스트에서 채널 ID(UC...)를 추출합니다."""
        # youtube.com/channel/UCxxxxxx 패턴
        if "channel/" in text:
            parts = text.split("channel/")
            if len(parts) > 1:
                cid = parts[1].split("/")[0].split("?")[0]
                if cid.startswith("UC") and len(cid) > 10:
                    return cid
        # 직접 입력한 채널 ID
        if text.startswith("UC") and len(text) > 10:
            return text
        return None

    def _extract_handle_from_url(self, url: str) -> Optional[str]:
        """youtube.com/@handle URL에서 핸들을 추출합니다."""
        try:
            parsed = urlparse(url)
            path = parsed.path
            if "/@" in path:
                handle = "@" + path.split("/@")[1].split("/")[0]
                return handle
        except Exception:
            pass
        return None

    def _parse_channel(self, item: dict) -> ChannelStats:
        snippet = item.get("snippet", {})
        stats = item.get("statistics", {})
        thumbnails = snippet.get("thumbnails", {})
        thumb = (
            thumbnails.get("high", {}).get("url")
            or thumbnails.get("medium", {}).get("url")
            or thumbnails.get("default", {}).get("url")
        )
        return ChannelStats(
            channel_id=item.get("id", ""),
            title=snippet.get("title", ""),
            description=snippet.get("description", ""),
            thumbnail_url=thumb,
            subscriber_count=int(stats["subscriberCount"]) if "subscriberCount" in stats else None,
            view_count=int(stats["viewCount"]) if "viewCount" in stats else None,
            video_count=int(stats["videoCount"]) if "videoCount" in stats else None,
            published_at=snippet.get("publishedAt"),
        )

    def _mock_channel_stats(self, channel_input: str) -> ChannelStats:
        return ChannelStats(
            channel_id="UCmock12345678901234567890",
            title=f"{channel_input} (미리보기)",
            description="API 키가 설정되지 않아 mock 데이터를 표시합니다.",
            thumbnail_url=None,
            subscriber_count=152000,
            view_count=45600000,
            video_count=320,
            published_at="2020-01-15T00:00:00Z",
        )

    async def _call_api(
        self, url: str, params: dict[str, Any]
    ) -> list[dict[str, Any]]:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            return resp.json().get("items", [])

    def _parse_video(self, item: dict) -> TrendingVideo:
        snippet = item.get("snippet", {})
        stats = item.get("statistics", {})
        thumbnails = snippet.get("thumbnails", {})
        thumb = (
            thumbnails.get("high", {}).get("url")
            or thumbnails.get("medium", {}).get("url")
            or thumbnails.get("default", {}).get("url")
        )
        return TrendingVideo(
            video_id=item.get("id", ""),
            title=snippet.get("title", ""),
            channel_title=snippet.get("channelTitle", ""),
            view_count=int(stats.get("viewCount", 0)),
            like_count=int(stats.get("likeCount", 0)) if "likeCount" in stats else None,
            comment_count=int(stats.get("commentCount", 0)) if "commentCount" in stats else None,
            published_at=snippet.get("publishedAt", ""),
            thumbnail_url=thumb,
            tags=snippet.get("tags", []),
        )
