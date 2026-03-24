import logging
from collections import Counter
from typing import Any
import httpx
from config import settings
from models.trend import TrendingVideo, TrendKeyword

logger = logging.getLogger(__name__)

YOUTUBE_TRENDING_URL = "https://www.googleapis.com/youtube/v3/videos"

_MOCK_VIDEOS = [
    TrendingVideo(
        video_id=f"mock_{i}",
        title=f"[급상승] 2025년 트렌드 영상 {i + 1} | 채널분석 인사이트",
        channel_title=f"채널{i + 1}",
        view_count=max(0, (20 - i)) * 1_000_000,
        like_count=max(0, (20 - i)) * 50_000,
        comment_count=max(0, (20 - i)) * 2_000,
        published_at="2025-03-15T09:00:00Z",
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
            return _MOCK_VIDEOS[:limit]

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
            return _MOCK_VIDEOS[:limit]

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
