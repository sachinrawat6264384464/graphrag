"""Neo4j graph database async client and connection manager."""

import time
from typing import Optional, Tuple
from neo4j import AsyncGraphDatabase, AsyncDriver
from backend.app.core.config import settings
from backend.app.core.logging import logger

_driver: Optional[AsyncDriver] = None


def get_neo4j_driver() -> AsyncDriver:
    """Retrieve or initialize singleton async Neo4j driver."""
    global _driver
    if _driver is None:
        _driver = AsyncGraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD),
            max_connection_lifetime=3600,
        )
    return _driver


async def close_neo4j_driver() -> None:
    """Close Neo4j driver on application shutdown."""
    global _driver
    if _driver is not None:
        await _driver.close()
        _driver = None


async def check_neo4j_connection() -> Tuple[bool, float, str]:
    """Verify connectivity to Neo4j. Returns (is_healthy, latency_ms, message)."""
    start = time.perf_counter()
    try:
        driver = get_neo4j_driver()
        # Verify connectivity using driver verify_connectivity
        await driver.verify_connectivity()
        latency = (time.perf_counter() - start) * 1000
        return True, round(latency, 2), "Neo4j connection OK"
    except Exception as exc:
        latency = (time.perf_counter() - start) * 1000
        logger.warning(f"Neo4j health check failed: {exc}")
        return False, round(latency, 2), str(exc)

