"""Health and system status schemas."""

from datetime import datetime, timezone
from typing import Dict, Optional, Literal
from pydantic import BaseModel, Field


class ServiceComponentStatus(BaseModel):
    """Status details for an individual infrastructure component."""

    status: Literal["healthy", "unhealthy", "disabled", "unknown"] = Field(
        ..., description="Component health state"
    )
    latency_ms: Optional[float] = Field(
        None, description="Response time in milliseconds if reachable"
    )
    details: Optional[str] = Field(
        None, description="Additional status or error information"
    )


class HealthResponse(BaseModel):
    """Basic liveness response schema."""

    status: Literal["alive", "healthy", "degraded", "unhealthy"] = "alive"
    app_name: str
    version: str
    environment: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ReadinessResponse(BaseModel):
    """Detailed readiness check schema covering core infrastructure."""

    status: Literal["healthy", "degraded", "unhealthy"]
    app_name: str
    version: str
    environment: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    services: Dict[str, ServiceComponentStatus]

