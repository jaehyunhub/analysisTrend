import json
from typing import Any, Optional
import redis.asyncio as aioredis
from config import settings


# 애플리케이션 시작 시 싱글턴으로 사용
_redis_client: Optional[aioredis.Redis] = None


async def get_redis() -> aioredis.Redis:
    """Redis 클라이언트 싱글턴 반환"""
    global _redis_client
    if _redis_client is None:
        _redis_client = await aioredis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=True,
        )
    return _redis_client


async def cache_get(key: str) -> Optional[Any]:
    """
    Redis에서 JSON 직렬화된 값을 조회합니다.

    Args:
        key: Redis 키

    Returns:
        역직렬화된 값, 없으면 None
    """
    # TODO: Redis 연결 에러 처리 (ConnectionError → None 반환)
    client = await get_redis()
    raw = await client.get(key)
    if raw is None:
        return None
    return json.loads(raw)


async def cache_set(key: str, value: Any, ttl: int = 3600) -> None:
    """
    값을 JSON으로 직렬화하여 Redis에 저장합니다.

    Args:
        key:   Redis 키
        value: 저장할 값 (JSON 직렬화 가능해야 함)
        ttl:   만료 시간(초), 기본 1시간
    """
    # TODO: Redis 연결 에러 처리 (ConnectionError → 로그 후 패스)
    client = await get_redis()
    await client.set(key, json.dumps(value, ensure_ascii=False), ex=ttl)


async def cache_delete(key: str) -> None:
    """
    Redis에서 키를 삭제합니다.

    Args:
        key: 삭제할 Redis 키
    """
    # TODO: Redis 연결 에러 처리
    client = await get_redis()
    await client.delete(key)
