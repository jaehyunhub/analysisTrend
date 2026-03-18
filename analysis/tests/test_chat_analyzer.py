import pytest
from services.chat_analyzer import ChatAnalyzer, _parse_minute_key


# ─── 타임스탬프 파싱 ──────────────────────────────────────────────────────────

def test_parse_minute_key_hms():
    assert _parse_minute_key("12:34:56") == "12:34"


def test_parse_minute_key_datetime():
    assert _parse_minute_key("2025-01-01 09:05:00") == "09:05"


def test_parse_minute_key_short():
    assert _parse_minute_key("10:30") == "10:30"


# ─── 빈 데이터 ────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_analyze_empty_data():
    analyzer = ChatAnalyzer()
    result = await analyzer.analyze([])
    assert result.total_messages == 0
    assert result.heatmap == []
    assert result.peaks == []
    assert result.top_keywords == []


# ─── 히트맵 집계 ──────────────────────────────────────────────────────────────

def test_build_heatmap_buckets():
    analyzer = ChatAnalyzer()
    records = [
        {"timestamp": "10:00:00", "user": "A", "message": "m1"},
        {"timestamp": "10:00:30", "user": "B", "message": "m2"},
        {"timestamp": "10:01:00", "user": "A", "message": "m3"},
    ]
    heatmap = analyzer._build_heatmap(records)
    assert len(heatmap) == 2  # 10:00 과 10:01 두 버킷
    assert heatmap[0].timestamp == "10:00"
    assert heatmap[0].count == 2
    assert heatmap[1].count == 1


def test_build_heatmap_normalized():
    analyzer = ChatAnalyzer()
    records = [
        {"timestamp": "10:00:00", "user": "A", "message": "msg"},
        {"timestamp": "10:00:00", "user": "B", "message": "msg"},
        {"timestamp": "10:01:00", "user": "A", "message": "msg"},
    ]
    heatmap = analyzer._build_heatmap(records)
    # 최댓값 버킷(count=2)은 normalized=1.0
    bucket_10_00 = next(b for b in heatmap if b.timestamp == "10:00")
    assert bucket_10_00.normalized == 1.0
    bucket_10_01 = next(b for b in heatmap if b.timestamp == "10:01")
    assert bucket_10_01.normalized == 0.5


# ─── 피크 감지 ────────────────────────────────────────────────────────────────

def test_detect_peaks_found():
    analyzer = ChatAnalyzer()
    from models.chat import HeatmapBucket
    # 평균=2, 낮은 σ → 10:05의 count=10은 피크
    heatmap = [
        HeatmapBucket(timestamp="10:00", count=1, normalized=0.1),
        HeatmapBucket(timestamp="10:01", count=1, normalized=0.1),
        HeatmapBucket(timestamp="10:02", count=2, normalized=0.2),
        HeatmapBucket(timestamp="10:03", count=1, normalized=0.1),
        HeatmapBucket(timestamp="10:04", count=2, normalized=0.2),
        HeatmapBucket(timestamp="10:05", count=10, normalized=1.0),
    ]
    peaks = analyzer._detect_peaks(heatmap)
    assert len(peaks) >= 1
    assert peaks[-1].peak_count == 10


def test_detect_peaks_single_bucket():
    analyzer = ChatAnalyzer()
    from models.chat import HeatmapBucket
    heatmap = [HeatmapBucket(timestamp="10:00", count=5, normalized=1.0)]
    peaks = analyzer._detect_peaks(heatmap)
    assert peaks == []


# ─── 키워드 추출 ──────────────────────────────────────────────────────────────

def test_fallback_keywords_top_n():
    analyzer = ChatAnalyzer()
    messages = ["AI 인공지능 트렌드"] * 10 + ["반도체 경제"] * 5
    keywords = analyzer._fallback_keywords(messages, top_n=3)
    assert "AI" in keywords or "인공지능" in keywords
    assert len(keywords) <= 3


def test_fallback_keywords_filters_stopwords():
    analyzer = ChatAnalyzer()
    messages = ["은 는 이 가 진짜 안녕하세요"]
    keywords = analyzer._fallback_keywords(messages, top_n=10)
    # 불용어는 포함되지 않아야 함
    for stopword in ["은", "는", "이", "가", "진짜"]:
        assert stopword not in keywords


# ─── 전체 analyze 통합 ────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_analyze_full_pipeline():
    analyzer = ChatAnalyzer()
    records = [
        {"timestamp": f"10:{i:02d}:00", "user": "Alice", "message": f"AI 트렌드 키워드{i}"}
        for i in range(10)
    ]
    result = await analyzer.analyze(records)
    assert result.total_messages == 10
    assert len(result.heatmap) == 10
    assert len(result.top_keywords) > 0
    assert result.session_id != ""


@pytest.mark.asyncio
async def test_analyze_returns_unique_session_id():
    analyzer = ChatAnalyzer()
    records = [{"timestamp": "10:00:00", "user": "A", "message": "hello"}]
    r1 = await analyzer.analyze(records)
    r2 = await analyzer.analyze(records)
    assert r1.session_id != r2.session_id
