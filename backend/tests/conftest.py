"""Pytest configuration and fixtures for NexusAI."""

from typing import AsyncGenerator
import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.db.session import engine


@pytest.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """Provide asynchronous HTTP client configured for testing the FastAPI application."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest.fixture(autouse=True)
async def dispose_db_pool() -> AsyncGenerator[None, None]:
    """Ensure database connection pool is cleanly disposed at test teardown."""
    yield
    await engine.dispose()
