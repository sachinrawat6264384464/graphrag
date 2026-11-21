"""Structured logging configuration for NexusAI."""

import logging
import sys
from backend.app.core.config import settings


def setup_logging() -> None:
    """Configure standard application logging."""
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO

    logging.basicConfig(
        level=log_level,
        format="%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d - %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
        force=True,
    )

    # Silence overly verbose external loggers in development
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("asyncio").setLevel(logging.WARNING)
    logging.getLogger("neo4j").setLevel(logging.WARNING)


logger = logging.getLogger("nexusai")

