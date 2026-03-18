import json
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
import services.cache as cache_module


@pytest.fixture(autouse=True)
def reset_redis_client():
    """각 테스트 전 싱글턴 초기화."""
    cache_module._redis_client = None
    yield
    cache_module._redis_client = None


def _make_mock_redis(get_value=None, set_ok=True):
    mock = AsyncMock()
    mock.get = AsyncMock(return_value=get_value)
    mock.set = AsyncMock(return_value=set_ok)
    mock.delete = AsyncMock(return_value=1)
    return mock


# ─── cache_get ───────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_cache_get_returns_parsed_value():
    data = {"key": "value", "num": 42}
    raw = json.dumps(data)
    mock_redis = _make_mock_redis(get_value=raw)

    with patch.object(cache_module, "get_redis", AsyncMock(return_value=mock_redis)):
        result = await cache_module.cache_get("test_key")

    assert result == data


@pytest.mark.asyncio
async def test_cache_get_returns_none_when_missing():
    mock_redis = _make_mock_redis(get_value=None)

    with patch.object(cache_module, "get_redis", AsyncMock(return_value=mock_redis)):
        result = await cache_module.cache_get("missing_key")

    assert result is None


@pytest.mark.asyncio
async def test_cache_get_returns_none_on_redis_error():
    mock_redis = AsyncMock()
    mock_redis.get = AsyncMock(side_effect=ConnectionError("Redis down"))

    with patch.object(cache_module, "get_redis", AsyncMock(return_value=mock_redis)):
        result = await cache_module.cache_get("error_key")

    assert result is None


# ─── cache_set ───────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_cache_set_serializes_and_stores():
    mock_redis = _make_mock_redis()

    with patch.object(cache_module, "get_redis", AsyncMock(return_value=mock_redis)):
        await cache_module.cache_set("test_key", {"foo": "bar"}, ttl=60)

    mock_redis.set.assert_called_once()
    call_args = mock_redis.set.call_args
    assert call_args[0][0] == "test_key"
    stored = json.loads(call_args[0][1])
    assert stored == {"foo": "bar"}
    assert call_args[1]["ex"] == 60


@pytest.mark.asyncio
async def test_cache_set_silently_ignores_error():
    mock_redis = AsyncMock()
    mock_redis.set = AsyncMock(side_effect=ConnectionError("Redis down"))

    with patch.object(cache_module, "get_redis", AsyncMock(return_value=mock_redis)):
        # 예외가 전파되지 않아야 함
        await cache_module.cache_set("key", "value")


# ─── cache_delete ────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_cache_delete_calls_redis_delete():
    mock_redis = _make_mock_redis()

    with patch.object(cache_module, "get_redis", AsyncMock(return_value=mock_redis)):
        await cache_module.cache_delete("test_key")

    mock_redis.delete.assert_called_once_with("test_key")


@pytest.mark.asyncio
async def test_cache_delete_silently_ignores_error():
    mock_redis = AsyncMock()
    mock_redis.delete = AsyncMock(side_effect=ConnectionError("Redis down"))

    with patch.object(cache_module, "get_redis", AsyncMock(return_value=mock_redis)):
        await cache_module.cache_delete("key")


# ─── get_redis 싱글턴 ─────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_redis_returns_singleton():
    mock_redis = _make_mock_redis()

    with patch("redis.asyncio.from_url", AsyncMock(return_value=mock_redis)):
        client1 = await cache_module.get_redis()
        client2 = await cache_module.get_redis()

    assert client1 is client2
