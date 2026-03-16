from pydantic import BaseModel
from typing import List


class HeatmapBucket(BaseModel):
    """시간대별 채팅 수 버킷 (히트맵 1개 셀)"""
    timestamp: str          # ISO 8601 시각 또는 "HH:MM" 문자열
    count: int              # 해당 시간대 채팅 수
    normalized: float       # 0.0 ~ 1.0 정규화 값


class PeakSegment(BaseModel):
    """채팅 피크 구간 정보"""
    start: str              # 구간 시작 시각 (ISO 8601)
    end: str                # 구간 종료 시각 (ISO 8601)
    peak_count: int         # 구간 내 최대 채팅 수
    keywords: List[str]     # 구간 내 주요 키워드


class KeywordTimeline(BaseModel):
    """키워드별 시간 흐름 데이터"""
    keyword: str
    timeline: List[HeatmapBucket]   # 시간대별 해당 키워드 언급 수


class ChatAnalysisResult(BaseModel):
    """채팅 분석 전체 결과"""
    session_id: str
    total_messages: int
    heatmap: List[HeatmapBucket]
    peaks: List[PeakSegment]
    top_keywords: List[str]
    keyword_timelines: List[KeywordTimeline]
