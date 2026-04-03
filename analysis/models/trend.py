from pydantic import BaseModel
from typing import Optional


class TrendKeyword(BaseModel):
    """트렌드 키워드 단일 항목"""
    keyword: str
    score: float                    # 트렌드 점수 (빈도, 검색량 등 기반)
    source: str                     # 출처 ("naver_news" | "youtube" | "combined")
    rank: Optional[int] = None      # 순위 (있을 경우)
    link: Optional[str] = None      # 대표 뉴스 원문 링크 (네이버 뉴스 API의 link 필드)


class TrendingVideo(BaseModel):
    """YouTube 트렌딩 동영상 단일 항목"""
    video_id: str
    title: str
    channel_title: str
    view_count: int
    like_count: Optional[int] = None
    comment_count: Optional[int] = None
    published_at: str               # ISO 8601 형식
    thumbnail_url: Optional[str] = None
    tags: list[str] = []


class NewsArticle(BaseModel):
    """네이버 뉴스 기사 단일 항목"""
    title: str
    description: str
    link: str
    original_link: Optional[str] = None
    pub_date: str
    source: str                     # 언론사명 (도메인 기반)


class ChannelStats(BaseModel):
    """YouTube 채널 통계"""
    channel_id: str
    title: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    subscriber_count: Optional[int] = None
    view_count: Optional[int] = None
    video_count: Optional[int] = None
    published_at: Optional[str] = None
