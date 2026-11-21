"""Redis connection and health check manager."""

import time
from typing import Optional, Tuple
import redis.asyncio as aioredis
from backend.app.core.config import settings
from backend.app.core.logging import logger

_redis_client: Optional[aioredis.Redis] = None


def get_redis_client() -> aioredis.Redis:
    """Retrieve or initialize async Redis client."""
    global _redis_client
    if _redis_client is None:
        _redis_client = aioredis.from_url(
            settings.REDIS_URL,
            protocol=2,  # Force RESP2 for backward compatibility
            encoding="utf-8",
            decode_responses=True,
            socket_timeout=3.0,
        )
    return _redis_client


async def close_redis_client() -> None:
    """Close Redis client on application shutdown."""
    global _redis_client
    if _redis_client is not None:
        await _redis_client.close()
        _redis_client = None


async def check_redis_connection() -> Tuple[bool, float, str]:
    """Verify connectivity to Redis. Returns (is_healthy, latency_ms, message)."""
    start = time.perf_counter()
    try:
        client = get_redis_client()
        pong = await client.ping()
        latency = (time.perf_counter() - start) * 1000
        if pong:
            return True, round(latency, 2), "Redis connection OK"
        return False, round(latency, 2), "Ping returned falsy value"
    except Exception as exc:
        latency = (time.perf_counter() - start) * 1000
        logger.warning(f"Redis health check failed: {exc}")
        return False, round(latency, 2), str(exc)

