"""Unit tests for health endpoints."""

import pytest
from httpx import AsyncClient
from unittest.mock import patch


@pytest.mark.asyncio
async def test_root_endpoint(async_client: AsyncClient):
    """Verify root index endpoint returns 200 and platform details."""
    response = await async_client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "NexusAI"
    assert data["status"] == "online"
    assert "docs" in data
    assert "health" in data


@pytest.mark.asyncio
async def test_health_liveness_endpoints(async_client: AsyncClient):
    """Verify both /api/v1/health and /api/v1/health/live return 200 and alive status."""
    for path in ["/api/v1/health", "/api/v1/health/live"]:
        response = await async_client.get(path)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "alive"
        assert data["app_name"] == "NexusAI"
        assert "version" in data
        assert "timestamp" in data


@pytest.mark.asyncio
async def test_health_readiness_structure(async_client: AsyncClient):
    """Verify /api/v1/health/ready returns valid service structure even when services are offline."""
    response = await async_client.get("/api/v1/health/ready")
    # Non-strict mode should return 200 even if dependencies are down in dev
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded", "unhealthy"]
    assert "services" in data
    assert "postgres" in data["services"]
    assert "neo4j" in data["services"]
    assert "redis" in data["services"]


@pytest.mark.asyncio
async def test_health_readiness_all_healthy(async_client: AsyncClient):
    """Verify readiness returns healthy when all backing services respond successfully."""
    with patch(
        "backend.app.api.v1.endpoints.health.check_postgres_connection",
        return_value=(True, 1.25, "PostgreSQL connection OK"),
    ), patch(
        "backend.app.api.v1.endpoints.health.check_neo4j_connection",
        return_value=(True, 2.50, "Neo4j connection OK"),
    ), patch(
        "backend.app.api.v1.endpoints.health.check_redis_connection",
        return_value=(True, 0.80, "Redis connection OK"),
    ):
        response = await async_client.get("/api/v1/health/ready")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["services"]["postgres"]["status"] == "healthy"
        assert data["services"]["neo4j"]["status"] == "healthy"
        assert data["services"]["redis"]["status"] == "healthy"


@pytest.mark.asyncio
async def test_health_readiness_strict_failure(async_client: AsyncClient):
    """Verify readiness strict=true returns 503 when services are unhealthy."""
    with patch(
        "backend.app.api.v1.endpoints.health.check_postgres_connection",
        return_value=(False, 0.0, "Connection refused"),
    ), patch(
        "backend.app.api.v1.endpoints.health.check_neo4j_connection",
        return_value=(False, 0.0, "Connection refused"),
    ), patch(
        "backend.app.api.v1.endpoints.health.check_redis_connection",
        return_value=(False, 0.0, "Connection refused"),
    ):
        response = await async_client.get("/api/v1/health/ready?strict=true")
        assert response.status_code == 503
        data = response.json()
        assert data["status"] == "unhealthy"

