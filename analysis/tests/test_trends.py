"""트렌드 수집 서비스 및 API 엔드포인트 테스트"""
import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, patch
from httpx import AsyncClient, ASGITransport
from main import app
from models.trend import TrendKeyword, TrendingVideo
from services.news_collector import NewsCollector
from services.youtube_collector import YouTubeCollector


# ─── NewsCollector 단위 테스트 ──────────────────────────────────────────────

@pytest.mark.asyncio
async def test_news_collector_returns_mock_when_no_api_key():
    """Naver API 키가 없으면 mock 키워드를 반환한다."""
    with patch("services.news_collector.settings") as mock_settings:
        mock_settings.naver_client_id = ""
        mock_settings.naver_client_secret = ""
        collector = NewsCollector()
        # 키가 없으므로 _mock_keywords 경로
        result = await collector.fetch(limit=5)
    assert len(result) == 5
    assert all(isinstance(kw, TrendKeyword) for kw in result)
    assert all(kw.source == "naver_news" for kw in result)
    assert result[0].rank == 1


@pytest.mark.asyncio
async def test_news_collector_mock_rank_order():
    """mock 키워드는 rank 오름차순으로 반환된다."""
    with patch("services.news_collector.settings") as mock_settings:
        mock_settings.naver_client_id = ""
        mock_settings.naver_client_secret = ""
        collector = NewsCollector()
        result = await collector.fetch(limit=10)
    ranks = [kw.rank for kw in result]
    assert ranks == list(range(1, len(ranks) + 1))


@pytest.mark.asyncio
async def test_news_collector_fallback_on_api_error():
    """API 호출 중 예외 발생 시 mock 데이터로 fallback한다."""
    with patch("services.news_collector.settings") as mock_settings:
        mock_settings.naver_client_id = "fake_id"
        mock_settings.naver_client_secret = "fake_secret"
        collector = NewsCollector()
        collector._call_api = AsyncMock(side_effect=Exception("network error"))
        result = await collector.fetch(limit=5)
    assert len(result) == 5
    assert all(kw.source == "naver_news" for kw in result)


# ─── YouTubeCollector 단위 테스트 ──────────────────────────────────────────

@pytest.mark.asyncio
async def test_youtube_collector_returns_mock_when_no_api_key():
    """YouTube API 키가 없으면 mock 동영상을 반환한다."""
    with patch("services.youtube_collector.settings") as mock_settings:
        mock_settings.youtube_api_key = ""
        collector = YouTubeCollector()
        result = await collector.fetch_trending(limit=5)
    assert len(result) == 5
    assert all(isinstance(v, TrendingVideo) for v in result)
    assert all(v.video_id.startswith("mock_") for v in result)


@pytest.mark.asyncio
async def test_youtube_collector_fetch_keywords_from_mock():
    """mock 동영상의 title/tags에서 키워드를 추출한다."""
    with patch("services.youtube_collector.settings") as mock_settings:
        mock_settings.youtube_api_key = ""
        collector = YouTubeCollector()
        result = await collector.fetch_keywords(limit=10)
    assert len(result) > 0
    assert all(isinstance(kw, TrendKeyword) for kw in result)
    assert all(kw.source == "youtube" for kw in result)


@pytest.mark.asyncio
async def test_youtube_collector_fallback_on_api_error():
    """API 호출 중 예외 발생 시 mock 데이터로 fallback한다."""
    with patch("services.youtube_collector.settings") as mock_settings:
        mock_settings.youtube_api_key = "fake_key"
        collector = YouTubeCollector()
        collector._call_api = AsyncMock(side_effect=Exception("quota exceeded"))
        result = await collector.fetch_trending(limit=5)
    assert len(result) == 5
    assert all(v.video_id.startswith("mock_") for v in result)


# ─── 트렌드 API 엔드포인트 통합 테스트 ─────────────────────────────────────

@pytest_asyncio.fixture
async def client():
    """FastAPI TestClient (ASGI Transport)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_news_endpoint_returns_200(client):
    """GET /trends/news — 200 OK, 리스트 반환."""
    response = await client.get("/trends/news")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


@pytest.mark.asyncio
async def test_news_endpoint_response_schema(client):
    """GET /trends/news — TrendKeyword 스키마 검증."""
    response = await client.get("/trends/news?limit=5")
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 5
    for item in items:
        assert "keyword" in item
        assert "score" in item
        assert "source" in item
        assert isinstance(item["score"], float)


@pytest.mark.asyncio
async def test_youtube_endpoint_returns_200(client):
    """GET /trends/youtube — 200 OK, 리스트 반환."""
    response = await client.get("/trends/youtube")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


@pytest.mark.asyncio
async def test_youtube_endpoint_response_schema(client):
    """GET /trends/youtube — TrendingVideo 스키마 검증."""
    response = await client.get("/trends/youtube?region=KR&category=0&limit=5")
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 5
    for item in items:
        assert "video_id" in item
        assert "title" in item
        assert "channel_title" in item
        assert "view_count" in item
        assert "published_at" in item
        assert "tags" in item
        assert isinstance(item["tags"], list)


@pytest.mark.asyncio
async def test_youtube_endpoint_region_param(client):
    """GET /trends/youtube?region=US — region 파라미터 처리 (mock이므로 동일 데이터)."""
    response_kr = await client.get("/trends/youtube?region=KR")
    response_us = await client.get("/trends/youtube?region=US")
    assert response_kr.status_code == 200
    assert response_us.status_code == 200


@pytest.mark.asyncio
async def test_keywords_endpoint_returns_200(client):
    """GET /trends/keywords — 200 OK, 리스트 반환."""
    response = await client.get("/trends/keywords")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


@pytest.mark.asyncio
async def test_keywords_endpoint_source_is_combined(client):
    """GET /trends/keywords — source 필드가 'combined' 이다."""
    response = await client.get("/trends/keywords")
    assert response.status_code == 200
    items = response.json()
    assert all(item["source"] == "combined" for item in items)


@pytest.mark.asyncio
async def test_keywords_endpoint_rank_order(client):
    """GET /trends/keywords — rank 오름차순 정렬 확인."""
    response = await client.get("/trends/keywords?limit=10")
    assert response.status_code == 200
    items = response.json()
    ranks = [item["rank"] for item in items]
    assert ranks == list(range(1, len(ranks) + 1))


@pytest.mark.asyncio
async def test_keywords_merged_scores(client):
    """GET /trends/keywords — 뉴스+YouTube 공통 키워드 점수가 합산된다."""
    # 실제 API 키 여부와 무관하게 결정적 결과를 보장하기 위해 mock 강제 사용
    with patch("services.news_collector.settings") as mock_ns, \
         patch("services.youtube_collector.settings") as mock_ys, \
         patch("routers.trends.cache_get", new=AsyncMock(return_value=None)), \
         patch("routers.trends.cache_set", new=AsyncMock()):
        mock_ns.naver_client_id = ""
        mock_ns.naver_client_secret = ""
        mock_ys.youtube_api_key = ""
        response = await client.get("/trends/keywords?limit=30")
    assert response.status_code == 200
    items = response.json()
    # "AI"는 뉴스 mock(1.0) + YouTube mock 태그 합산이므로 1.0 초과여야 함
    ai_item = next((i for i in items if i["keyword"] == "AI"), None)
    assert ai_item is not None
    assert ai_item["score"] > 1.0
