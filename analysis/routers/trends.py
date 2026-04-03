import logging
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models.trend import TrendKeyword, TrendingVideo, NewsArticle, ChannelStats
from services.news_collector import NewsCollector
from services.youtube_collector import YouTubeCollector
from services.cache import cache_get, cache_set

logger = logging.getLogger(__name__)
router = APIRouter(tags=["trends"])

_CACHE_TTL = 1800  # 30분


@router.get("/news", response_model=List[TrendKeyword])
async def get_news_keywords(limit: int = 30) -> List[TrendKeyword]:
    """네이버 뉴스 API를 통해 수집한 트렌드 키워드 목록을 반환합니다."""
    cached = await cache_get("news_keywords")
    if cached:
        return [TrendKeyword(**item) for item in cached[:limit]]

    collector = NewsCollector()
    keywords = await collector.fetch(limit=limit)
    await cache_set("news_keywords", [k.model_dump() for k in keywords], ttl=_CACHE_TTL)
    return keywords


@router.get("/youtube", response_model=List[TrendingVideo])
async def get_youtube_trending(
    region: str = "KR",
    category: str = "0",
    limit: int = 20,
) -> List[TrendingVideo]:
    """YouTube Data API를 통해 수집한 트렌딩 동영상 목록을 반환합니다."""
    cache_key = f"trending_{region}_{category}"
    cached = await cache_get(cache_key)
    if cached:
        return [TrendingVideo(**item) for item in cached[:limit]]

    collector = YouTubeCollector()
    videos = await collector.fetch_trending(
        region_code=region, category_id=category, limit=limit
    )
    await cache_set(cache_key, [v.model_dump() for v in videos], ttl=_CACHE_TTL)
    return videos


@router.get("/news/articles", response_model=List[NewsArticle])
async def get_news_articles(limit: int = 20, query: str = "트렌드") -> List[NewsArticle]:
    """네이버 뉴스 최신 기사 목록을 반환합니다."""
    cache_key = f"news_articles_{query}_{limit}"
    cached = await cache_get(cache_key)
    if cached:
        return [NewsArticle(**item) for item in cached]

    collector = NewsCollector()
    articles = await collector.fetch_articles(query=query, limit=limit)
    await cache_set(cache_key, [a.model_dump() for a in articles], ttl=_CACHE_TTL)
    return articles


@router.get("/channel/stats", response_model=ChannelStats)
async def get_channel_stats(channel: str = Query(..., description="채널 URL, @핸들, 또는 채널 ID")) -> ChannelStats:
    """YouTube 채널 통계를 조회합니다."""
    collector = YouTubeCollector()
    stats = await collector.fetch_channel_stats(channel)
    if stats is None:
        raise HTTPException(status_code=404, detail="채널을 찾을 수 없습니다.")
    return stats


@router.get("/keywords", response_model=List[TrendKeyword])
async def get_combined_keywords(limit: int = 20) -> List[TrendKeyword]:
    """뉴스 + YouTube 기반 통합 트렌드 키워드를 반환합니다."""
    cached = await cache_get("combined_keywords")
    if cached:
        return [TrendKeyword(**item) for item in cached[:limit]]

    news_collector = NewsCollector()
    yt_collector = YouTubeCollector()

    news_kws = await news_collector.fetch(limit=30)
    yt_kws = await yt_collector.fetch_keywords(limit=30)

    # 점수 합산 병합
    merged: dict[str, float] = {}
    for kw in news_kws:
        merged[kw.keyword] = merged.get(kw.keyword, 0) + kw.score
    for kw in yt_kws:
        merged[kw.keyword] = merged.get(kw.keyword, 0) + kw.score

    combined = [
        TrendKeyword(
            keyword=kw,
            score=round(score, 4),
            source="combined",
            rank=i + 1,
        )
        for i, (kw, score) in enumerate(
            sorted(merged.items(), key=lambda x: -x[1])[:limit]
        )
    ]

    await cache_set("combined_keywords", [k.model_dump() for k in combined], ttl=_CACHE_TTL)
    return combined
