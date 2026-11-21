"""Health check endpoints for liveness and readiness probes."""

import asyncio
from fastapi import APIRouter, status, Response, Query
from backend.app.core.config import settings
from backend.app.schemas.health import (
    HealthResponse,
    ReadinessResponse,
    ServiceComponentStatus,
)
from backend.app.db.session import check_postgres_connection
from backend.app.db.neo4j import check_neo4j_connection
from backend.app.db.redis import check_redis_connection

router = APIRouter()


@router.get(
    "/live",
    response_model=HealthResponse,
    summary="Liveness Probe",
    description="Quick check indicating if the FastAPI application process is alive and responsive.",
)
async def liveness_probe() -> HealthResponse:
    """Fast liveness check that does not depend on backing services."""
    return HealthResponse(
        status="alive",
        app_name=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
    )


@router.get(
    "/ready",
    response_model=ReadinessResponse,
    summary="Readiness Probe",
    description="Deep readiness check verifying connections to PostgreSQL, Neo4j, and Redis.",
)
async def readiness_probe(
    response: Response,
    strict: bool = Query(
        False,
        description="If True, returns HTTP 503 when any dependency is unhealthy",
    ),
) -> ReadinessResponse:
    """Check connectivity to PostgreSQL, Neo4j, and Redis concurrently."""
    # Execute all 3 checks in parallel with safe exception handling
    results = await asyncio.gather(
        check_postgres_connection(),
        check_neo4j_connection(),
        check_redis_connection(),
        return_exceptions=True,
    )

    pg_res, neo_res, redis_res = results

    # Helper to parse tuple or exception
    def parse_result(res) -> ServiceComponentStatus:
        if isinstance(res, Exception):
            return ServiceComponentStatus(
                status="unhealthy", details=str(res), latency_ms=None
            )
        is_healthy, latency, msg = res
        return ServiceComponentStatus(
            status="healthy" if is_healthy else "unhealthy",
            latency_ms=latency,
            details=msg,
        )

    services_status = {
        "postgres": parse_result(pg_res),
        "neo4j": parse_result(neo_res),
        "redis": parse_result(redis_res),
    }

    healthy_count = sum(
        1 for s in services_status.values() if s.status == "healthy"
    )

    if healthy_count == len(services_status):
        overall_status = "healthy"
    elif healthy_count > 0:
        overall_status = "degraded"
    else:
        overall_status = "unhealthy"

    # In strict mode, fail readiness if not fully healthy
    if strict and overall_status != "healthy":
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return ReadinessResponse(
        status=overall_status,
        app_name=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        services=services_status,
    )


@router.get(
    "",
    response_model=HealthResponse,
    summary="Root Health Check",
    description="Default health endpoint returning current application liveness.",
)
async def root_health() -> HealthResponse:
    """Default health alias for liveness."""
    return await liveness_probe()

