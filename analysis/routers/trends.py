from fastapi import APIRouter, HTTPException
from typing import List
from models.trend import TrendKeyword, TrendingVideo

router = APIRouter(tags=["trends"])


@router.get("/news", response_model=List[TrendKeyword])
async def get_news_keywords(limit: int = 20) -> List[TrendKeyword]:
    """
    네이버 뉴스 API를 통해 수집한 트렌드 키워드 목록을 반환합니다.
    """
    # TODO: NewsCollector.fetch() 호출
    # TODO: Redis 캐시 확인 → 없으면 API 호출 후 캐시 저장
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/youtube", response_model=List[TrendingVideo])
async def get_youtube_trending(limit: int = 20) -> List[TrendingVideo]:
    """
    YouTube Data API를 통해 수집한 트렌딩 동영상 목록을 반환합니다.
    """
    # TODO: YouTubeCollector.fetch() 호출
    # TODO: Redis 캐시 확인 → 없으면 API 호출 후 캐시 저장
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/keywords", response_model=List[TrendKeyword])
async def get_combined_keywords(limit: int = 20) -> List[TrendKeyword]:
    """
    뉴스 + YouTube 기반 통합 트렌드 키워드를 반환합니다.
    """
    # TODO: NewsCollector + YouTubeCollector 결과 병합
    # TODO: soynlp로 키워드 정규화 및 빈도 계산
    raise HTTPException(status_code=501, detail="Not implemented yet")
