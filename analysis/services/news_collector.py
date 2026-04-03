import logging
import re
from collections import Counter
from typing import Any
from urllib.parse import urlparse
import httpx
from config import settings
from models.trend import TrendKeyword, NewsArticle

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

    async def fetch_articles(self, query: str = "트렌드", limit: int = 20) -> list[NewsArticle]:
        """최신 뉴스 기사 목록을 반환합니다 (HTML 태그 제거)."""
        if not self._client_id or not self._client_secret:
            logger.info("Naver API 키 없음 — mock 기사 반환")
            return self._mock_articles(limit)

        try:
            articles = await self._call_api(query, display=min(limit, 100))
            return self._parse_articles(articles, limit)
        except Exception as e:
            logger.warning("NewsCollector.fetch_articles 실패, mock fallback: %s", e)
            return self._mock_articles(limit)

    def _parse_articles(self, items: list[dict], limit: int) -> list[NewsArticle]:
        result = []
        for item in items[:limit]:
            title = re.sub(r"<[^>]+>", "", item.get("title", "")).strip()
            desc = re.sub(r"<[^>]+>", "", item.get("description", "")).strip()
            link = item.get("link", "")
            original_link = item.get("originallink", link)
            pub_date = item.get("pubDate", "")

            # 언론사명: originallink 도메인에서 추출
            source = ""
            try:
                parsed = urlparse(original_link or link)
                source = parsed.netloc.replace("www.", "")
            except Exception:
                source = "뉴스"

            result.append(NewsArticle(
                title=title,
                description=desc,
                link=link,
                original_link=original_link,
                pub_date=pub_date,
                source=source,
            ))
        return result

    def _mock_articles(self, limit: int) -> list[NewsArticle]:
        mock_data = [
            ("AI 반도체 수출 규제, 글로벌 공급망에 미치는 영향", "미국이 첨단 AI 반도체에 대한 수출 규제를 강화하면서 글로벌 공급망에 상당한 변화가 예상됩니다.", "https://www.hani.co.kr", "hani.co.kr"),
            ("삼성전자 HBM3E 양산 돌입...엔비디아 공급 확대", "삼성전자가 차세대 고대역폭 메모리 HBM3E 양산을 본격화하며 엔비디아와의 협력을 강화한다고 발표했습니다.", "https://www.mk.co.kr", "mk.co.kr"),
            ("국내 스타트업 투자 한파...작년 대비 40% 감소", "국내 벤처캐피탈 투자 규모가 지속적으로 줄어드는 가운데, 스타트업들의 운영난이 심화되고 있습니다.", "https://www.chosun.com", "chosun.com"),
            ("유튜브, 쇼츠 수익화 정책 전면 개편...크리에이터 반응은?", "유튜브가 쇼츠 광고 수익 분배 방식을 전면 개편하면서 크리에이터 커뮤니티에서 갑론을박이 이어지고 있습니다.", "https://www.jtbc.co.kr", "jtbc.co.kr"),
            ("전기차 시장 성장세 둔화...배터리 원자재 가격 영향", "글로벌 전기차 판매 증가세가 예상보다 낮은 수준에 머물고 있으며, 리튬 등 원자재 가격 변동이 주요 원인으로 지목됩니다.", "https://www.hankyung.com", "hankyung.com"),
        ]
        result = []
        for i, (title, desc, link, source) in enumerate(mock_data[:limit]):
            result.append(NewsArticle(
                title=title, description=desc, link=link,
                pub_date="Mon, 01 Apr 2026 10:00:00 +0900", source=source,
            ))
        return result

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
        # 키워드별 첫 등장 뉴스 링크 저장 (대표 원문 링크로 사용)
        keyword_link: dict[str, str] = {}

        for article in articles:
            raw_title = article.get("title", "")
            raw_desc = article.get("description", "")
            article_link = article.get("link", "")
            text = f"{raw_title} {raw_desc}"
            # HTML 태그 제거
            text = re.sub(r"<[^>]+>", "", text)
            for token in text.split():
                token = token.strip(".,!?~^\"'[](){}|")
                if len(token) >= 2 and token not in _STOPWORDS:
                    counter[token] += 1
                    # 첫 등장 기사의 링크를 대표 링크로 등록
                    if token not in keyword_link and article_link:
                        keyword_link[token] = article_link

        total = sum(counter.values()) or 1
        return [
            TrendKeyword(
                keyword=kw,
                score=round(count / total, 4),
                source="naver_news",
                rank=i + 1,
                link=keyword_link.get(kw),
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
