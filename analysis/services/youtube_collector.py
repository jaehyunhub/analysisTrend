import httpx
from typing import Any
from config import settings
from models.trend import TrendingVideo, TrendKeyword


YOUTUBE_TRENDING_URL = "https://www.googleapis.com/youtube/v3/videos"
YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"


class YouTubeCollector:
    """
    YouTube Data API v3를 통해 트렌딩 동영상과 키워드를 수집합니다.

    사용 예시:
        collector = YouTubeCollector()
        videos = await collector.fetch_trending(limit=20)
        keywords = await collector.fetch_keywords(limit=20)
    """

    def __init__(self) -> None:
        self._api_key = settings.youtube_api_key

    async def fetch_trending(
        self, region_code: str = "KR", limit: int = 20
    ) -> list[TrendingVideo]:
        """
        YouTube 트렌딩 동영상 목록을 반환합니다.

        Args:
            region_code: 국가 코드 (기본 KR)
            limit:       반환할 동영상 수

        Returns:
            TrendingVideo 리스트
        """
        # TODO: YouTube videos.list API 호출 (chart=mostPopular)
        # TODO: part=snippet,statistics 요청
        # TODO: 응답 items를 TrendingVideo로 변환
        return []

    async def fetch_keywords(self, limit: int = 20) -> list[TrendKeyword]:
        """
        트렌딩 동영상 제목/태그에서 키워드를 추출하여 반환합니다.

        Args:
            limit: 반환할 키워드 수

        Returns:
            TrendKeyword 리스트 (score 내림차순)
        """
        # TODO: fetch_trending() 호출
        # TODO: 제목 + 태그 텍스트 병합
        # TODO: soynlp로 키워드 추출 및 빈도 계산
        return []

    async def _call_api(
        self, url: str, params: dict[str, Any]
    ) -> list[dict[str, Any]]:
        """YouTube Data API 공통 호출 (내부용)"""
        # TODO: API 키 미설정 시 빈 리스트 반환
        # TODO: httpx.AsyncClient로 GET 요청 (타임아웃 10초)
        # TODO: HTTPStatusError 처리 및 로깅
        return []
