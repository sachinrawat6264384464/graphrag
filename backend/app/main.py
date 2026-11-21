"""FastAPI main application entrypoint for NexusAI."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.logging import setup_logging, logger
from backend.app.api.router import api_router
from backend.app.db.neo4j import close_neo4j_driver
from backend.app.db.redis import close_redis_client
from backend.app.db.session import engine
from backend.app.models import Base


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager for startup and graceful shutdown."""
    setup_logging()
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION} [{settings.ENVIRONMENT}]")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database schemas verified/created successfully.")
    except Exception as exc:
        logger.warning(f"Database schema auto-creation skipped or deferred: {exc}")
    yield
    # Graceful shutdown of persistent connections
    logger.info("Shutting down NexusAI services and closing connection pools...")
    await close_neo4j_driver()
    await close_redis_client()
    await engine.dispose()
    logger.info("Shutdown complete.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise Hybrid RAG + GraphRAG Intelligence Platform",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# CORS Configuration
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Mount API routers
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Root"])
async def root_index():
    """Root entry point providing basic platform info and links to docs."""
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": f"{settings.API_V1_STR}/docs",
        "health": f"{settings.API_V1_STR}/health",
    }

