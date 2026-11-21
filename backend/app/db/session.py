"""PostgreSQL Async Engine and Session Factory."""

import time
from typing import AsyncGenerator, Tuple
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy import text
from backend.app.core.config import settings
from backend.app.core.logging import logger

# Create async engine with connection pooling
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for obtaining async DB session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def check_postgres_connection() -> Tuple[bool, float, str]:
    """Verify connectivity to PostgreSQL. Returns (is_healthy, latency_ms, message)."""
    start = time.perf_counter()
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        latency = (time.perf_counter() - start) * 1000
        return True, round(latency, 2), "PostgreSQL connection OK"
    except Exception as exc:
        latency = (time.perf_counter() - start) * 1000
        logger.warning(f"PostgreSQL health check failed: {exc}")
        return False, round(latency, 2), str(exc)

