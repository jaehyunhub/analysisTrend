import logging
from collections import Counter
from typing import Any
import httpx
from config import settings
from models.trend import TrendKeyword

logger = logging.getLogger(__name__)

NAVER_NEWS_SEARCH_URL = "https://openapi.naver.com/v1/search/news.json"

_STOPWORDS = {
    "은", "는", "이", "가", "을", "를", "의", "에", "에서", "으로", "로",
    "와", "과", "도", "만", "그", "이", "저", "것", "거", "수",
    "년", "월", "일", "위해", "대한", "통해", "관련", "따른",
}

_MOCK_KEYWORDS = [
    "AI", "인공지능", "반도체", "경제", "주식", "환율", "금리", "부동산",
    "유튜브", "트렌드", "스타트업", "빅테크", "ChatGPT", "ESG", "탄소중립",
    "메타버스", "NFT", "크리에이터", "숏폼", "알고리즘", "구독", "콘텐츠",
    "스트리밍", "OTT", "플랫폼", "데이터", "클라우드", "사이버보안", "핀테크",
    "리튬", "전기차",
]


class NewsCollector:
    """네이버 뉴스 검색 API를 통해 트렌드 키워드를 수집합니다."""

    def __init__(self) -> None:
        self._client_id = settings.naver_client_id
        self._client_secret = settings.naver_client_secret

    async def fetch(self, query: str = "트렌드", limit: int = 30) -> list[TrendKeyword]:
        if not self._client_id or not self._client_secret:
            logger.info("Naver API 키 없음 — mock 데이터 반환")
            return self._mock_keywords(limit)

        try:
            articles = await self._call_api(query, display=100)
            return self._extract_keywords(articles, limit)
        except Exception as e:
            logger.warning("NewsCollector.fetch 실패, mock fallback: %s", e)
            return self._mock_keywords(limit)

    async def _call_api(self, query: str, display: int = 100) -> list[dict[str, Any]]:
        headers = {
            "X-Naver-Client-Id": self._client_id,
            "X-Naver-Client-Secret": self._client_secret,
        }
        params = {"query": query, "display": display, "sort": "date"}

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(NAVER_NEWS_SEARCH_URL, headers=headers, params=params)
            resp.raise_for_status()
            return resp.json().get("items", [])

    def _extract_keywords(self, articles: list[dict], limit: int) -> list[TrendKeyword]:
        counter: Counter = Counter()
        for article in articles:
            text = f"{article.get('title', '')} {article.get('description', '')}"
            # HTML 태그 제거
            import re
            text = re.sub(r"<[^>]+>", "", text)
            for token in text.split():
                token = token.strip(".,!?~^\"'[](){}|")
                if len(token) >= 2 and token not in _STOPWORDS:
                    counter[token] += 1

        total = sum(counter.values()) or 1
        return [
            TrendKeyword(
                keyword=kw,
                score=round(count / total, 4),
                source="naver_news",
                rank=i + 1,
            )
            for i, (kw, count) in enumerate(counter.most_common(limit))
        ]

    def _mock_keywords(self, limit: int) -> list[TrendKeyword]:
        return [
            TrendKeyword(
                keyword=kw,
                score=round(1.0 - i * 0.03, 3),
                source="naver_news",
                rank=i + 1,
            )
            for i, kw in enumerate(_MOCK_KEYWORDS[:limit])
        ]
