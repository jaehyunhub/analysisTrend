import json
import logging
from typing import Any, Optional
import redis.asyncio as aioredis
from config import settings

logger = logging.getLogger(__name__)

_redis_client: Optional[aioredis.Redis] = None


async def get_redis() -> aioredis.Redis:
    """Redis 클라이언트 싱글턴 반환."""
    global _redis_client
    if _redis_client is None:
        _redis_client = await aioredis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=True,
        )
    return _redis_client


async def cache_get(key: str) -> Optional[Any]:
    """Redis에서 JSON 직렬화된 값을 조회합니다. 연결 실패 시 None 반환."""
    try:
        client = await get_redis()
        raw = await client.get(key)
        if raw is None:
            return None
        return json.loads(raw)
    except Exception as e:
        logger.warning("cache_get 실패 (key=%s): %s", key, e)
        return None


async def cache_set(key: str, value: Any, ttl: int = 3600) -> None:
    """값을 JSON으로 직렬화하여 Redis에 저장합니다. 연결 실패 시 무시."""
    try:
        client = await get_redis()
        await client.set(key, json.dumps(value, ensure_ascii=False), ex=ttl)
    except Exception as e:
        logger.warning("cache_set 실패 (key=%s): %s", key, e)


async def cache_delete(key: str) -> None:
    """Redis에서 키를 삭제합니다. 연결 실패 시 무시."""
    try:
        client = await get_redis()
        await client.delete(key)
    except Exception as e:
        logger.warning("cache_delete 실패 (key=%s): %s", key, e)
