"""Unit tests for configuration loading."""

from backend.app.core.config import Settings


def test_default_settings():
    """Verify default settings instantiation and types."""
    cfg = Settings()
    assert cfg.PROJECT_NAME == "NexusAI"
    assert cfg.API_V1_STR == "/api/v1"
    assert isinstance(cfg.BACKEND_CORS_ORIGINS, list)
    assert cfg.POSTGRES_PORT == 5432
    assert cfg.EMBEDDING_DIMENSION == 384


def test_cors_string_parsing():
    """Verify string comma-separated CORS origins parse correctly."""
    cfg = Settings(BACKEND_CORS_ORIGINS="http://localhost:3000,https://app.nexusai.internal")
    assert len(cfg.BACKEND_CORS_ORIGINS) == 2
    assert "http://localhost:3000" in cfg.BACKEND_CORS_ORIGINS
    assert "https://app.nexusai.internal" in cfg.BACKEND_CORS_ORIGINS

