"""Central API Router consolidating versioned endpoints."""

from fastapi import APIRouter
from backend.app.api.v1.endpoints import auth, documents, health, workspaces

api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["Health & System"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(workspaces.router, prefix="/workspaces", tags=["Multi-Tenant Workspaces"])
api_router.include_router(documents.router, prefix="/workspaces", tags=["Documents & Ingestion"])

