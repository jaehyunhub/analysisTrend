import uuid
import statistics
from collections import Counter, defaultdict
from typing import Any
from models.chat import ChatAnalysisResult, HeatmapBucket, PeakSegment, KeywordTimeline

# 한국어 불용어
_STOPWORDS = {
    "은", "는", "이", "가", "을", "를", "의", "에", "에서", "으로", "로",
    "와", "과", "도", "만", "에게", "한테", "부터", "까지", "처럼", "보다",
    "ㅋ", "ㅎ", "ㅠ", "ㅜ", "ㄷ", "ㄱ", "ㅁ", "ㅇ", "ㅂ", "ㅅ", "ㄴ",
    "그", "이", "저", "것", "거", "수", "때", "말", "년", "월", "일",
    "진짜", "정말", "너무", "그냥", "좀", "더", "다", "또", "안", "못",
}


def _parse_minute_key(timestamp: str) -> str:
    """타임스탬프에서 분 단위 키(HH:MM) 추출. 파싱 실패 시 원본 반환."""
    ts = timestamp.strip()
    # HH:MM:SS 형식
    parts = ts.split(":")
    if len(parts) >= 2:
        try:
            return f"{int(parts[0]):02d}:{int(parts[1]):02d}"
        except ValueError:
            pass
    # YYYY-MM-DD HH:MM:SS 형식
    if " " in ts:
        time_part = ts.split(" ", 1)[1]
        return _parse_minute_key(time_part)
    return ts[:5] if len(ts) >= 5 else ts


class ChatAnalyzer:
    """채팅 데이터를 분석하여 히트맵, 피크 구간, 키워드 타임라인을 생성합니다."""

    async def analyze(
        self,
        raw_data: list[dict[str, Any]],
        search_keywords: list[str] | None = None,
    ) -> ChatAnalysisResult:
        if not raw_data:
            return ChatAnalysisResult(
                session_id=str(uuid.uuid4()),
                total_messages=0,
                heatmap=[],
                peaks=[],
                top_keywords=[],
                keyword_timelines=[],
            )

        heatmap = self._build_heatmap(raw_data)
        peaks = self._detect_peaks(heatmap)
        extracted = self._extract_keywords(raw_data)

        # 사용자 검색 키워드를 앞에 배치하고 자동 추출 키워드로 채움 (중복 제거)
        search_kws = [k for k in (search_keywords or []) if k]
        merged = list(dict.fromkeys(search_kws + extracted))

        timelines = self._build_keyword_timelines(raw_data, merged[:30])

        # top_keywords: 검색 키워드 우선 + 나머지 자동 추출
        top_keywords = list(dict.fromkeys(search_kws + extracted))[:20]

        # 각 피크 구간에 해당 시간대 주요 키워드 할당
        peaks = self._assign_peak_keywords(raw_data, peaks, top_keywords)

        return ChatAnalysisResult(
            session_id=str(uuid.uuid4()),
            total_messages=len(raw_data),
            heatmap=heatmap,
            peaks=peaks,
            top_keywords=top_keywords,
            keyword_timelines=timelines,
        )

    def _build_heatmap(self, records: list[dict]) -> list[HeatmapBucket]:
        """1분 단위 버킷으로 집계 후 최댓값 기준 0~1 정규화."""
        bucket: dict[str, int] = defaultdict(int)
        for r in records:
            key = _parse_minute_key(r.get("timestamp", ""))
            bucket[key] += 1

        if not bucket:
            return []

        sorted_keys = sorted(bucket.keys())
        max_count = max(bucket.values())

        return [
            HeatmapBucket(
                timestamp=key,
                count=bucket[key],
                normalized=bucket[key] / max_count if max_count > 0 else 0.0,
            )
            for key in sorted_keys
        ]

    def _detect_peaks(
        self, heatmap: list[HeatmapBucket], sigma_factor: float = 1.5
    ) -> list[PeakSegment]:
        """평균 + sigma_factor * σ 초과 버킷을 피크로 추출하고 연속 구간 병합."""
        if len(heatmap) < 2:
            return []

        counts = [b.count for b in heatmap]
        avg = statistics.mean(counts)
        try:
            std = statistics.stdev(counts)
        except statistics.StatisticsError:
            std = 0.0

        threshold = avg + sigma_factor * std
        peaks: list[PeakSegment] = []
        i = 0

        while i < len(heatmap):
            if heatmap[i].count > threshold:
                start = i
                max_count = heatmap[i].count
                while i < len(heatmap) and heatmap[i].count > threshold:
                    max_count = max(max_count, heatmap[i].count)
                    i += 1
                peaks.append(
                    PeakSegment(
                        start=heatmap[start].timestamp,
                        end=heatmap[i - 1].timestamp,
                        peak_count=max_count,
                        keywords=[],  # 키워드는 별도 분석
                    )
                )
            else:
                i += 1

        return peaks

    def _extract_keywords(self, records: list[dict], top_n: int = 20) -> list[str]:
        """키워드 추출: soynlp 우선, 실패 시 단순 빈도 기반 fallback."""
        messages = [r.get("message", "") for r in records]

        try:
            from soynlp.word import WordExtractor  # type: ignore
            extractor = WordExtractor()
            extractor.train(messages)
            word_scores = extractor.extract()
            candidates = [
                w for w, s in sorted(word_scores.items(), key=lambda x: -x[1].cohesion_forward)
                if len(w) >= 2 and w not in _STOPWORDS
            ]
            return candidates[:top_n]
        except (ImportError, Exception):
            return self._fallback_keywords(messages, top_n)

    def _fallback_keywords(self, messages: list[str], top_n: int) -> list[str]:
        """단순 빈도 기반 키워드 추출 (soynlp 불가 시)."""
        counter: Counter = Counter()
        for msg in messages:
            # 공백 분리 + 2글자 이상 + 불용어 제거
            for token in msg.split():
                token = token.strip(".,!?~^^ㅋㅎ[](){}\"'")
                if len(token) >= 2 and token not in _STOPWORDS:
                    counter[token] += 1
        return [word for word, _ in counter.most_common(top_n)]

    def _assign_peak_keywords(
        self, records: list[dict], peaks: list[PeakSegment], keywords: list[str]
    ) -> list[PeakSegment]:
        """각 피크 구간에 해당 시간대에서 가장 많이 등장한 키워드를 할당."""
        if not keywords:
            return peaks
        for peak in peaks:
            counter: Counter = Counter()
            for r in records:
                key = _parse_minute_key(r.get("timestamp", ""))
                if peak.start <= key <= peak.end:
                    msg = r.get("message", "").lower()
                    for kw in keywords:
                        if kw.lower() in msg:
                            counter[kw] += 1
            peak.keywords = [kw for kw, _ in counter.most_common(5)]
        return peaks

    def _build_keyword_timelines(
        self, records: list[dict], keywords: list[str]
    ) -> list[KeywordTimeline]:
        """키워드별 분당 언급 횟수 시계열 + 등장 타임스탬프 목록 생성."""
        if not keywords:
            return []

        timeline_data: dict[str, dict[str, int]] = {kw: defaultdict(int) for kw in keywords}

        for r in records:
            minute_key = _parse_minute_key(r.get("timestamp", ""))
            msg = r.get("message", "").lower()
            for kw in keywords:
                if kw.lower() in msg:
                    timeline_data[kw][minute_key] += 1

        all_keys = sorted({
            _parse_minute_key(r.get("timestamp", ""))
            for r in records
        })

        result = []
        for kw in keywords:
            buckets = [
                HeatmapBucket(timestamp=k, count=timeline_data[kw].get(k, 0), normalized=0.0)
                for k in all_keys
            ]
            # 키워드가 실제로 등장한 분 단위 타임스탬프만 수집
            timestamps = [k for k in all_keys if timeline_data[kw].get(k, 0) > 0]
            result.append(KeywordTimeline(keyword=kw, timeline=buckets, timestamps=timestamps))

        return result
