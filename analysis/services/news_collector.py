import httpx
from typing import Any
from config import settings
from models.trend import TrendKeyword


NAVER_NEWS_SEARCH_URL = "https://openapi.naver.com/v1/search/news.json"


class NewsCollector:
    """
    네이버 뉴스 검색 API를 통해 트렌드 키워드를 수집합니다.

    사용 예시:
        collector = NewsCollector()
        keywords = await collector.fetch(query="AI", limit=20)
    """

    def __init__(self) -> None:
        self._client_id = settings.naver_client_id
        self._client_secret = settings.naver_client_secret

    async def fetch(self, query: str = "트렌드", limit: int = 20) -> list[TrendKeyword]:
        """
        네이버 뉴스 API로 기사를 검색하고 키워드 빈도를 분석하여 반환합니다.

        Args:
            query: 검색어
            limit: 반환할 키워드 수

        Returns:
            TrendKeyword 리스트 (score 내림차순)
        """
        # TODO: httpx.AsyncClient로 Naver API 호출
        # TODO: API 인증 헤더 설정 (X-Naver-Client-Id, X-Naver-Client-Secret)
        # TODO: 응답 기사 제목/설명에서 soynlp로 키워드 추출
        # TODO: 키워드 빈도 계산 후 TrendKeyword 리스트 반환
        return []

    async def _call_api(self, query: str, display: int = 100) -> list[dict[str, Any]]:
        """네이버 뉴스 검색 API 호출 (내부용)"""
        # TODO: API 키 미설정 시 빈 리스트 반환
        # TODO: httpx 타임아웃 설정 (10초)
        # TODO: HTTPStatusError 처리
        return []
