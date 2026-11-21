"""GraphRAG API Endpoints: Knowledge Graph Extraction, Querying, and Multi-Hop Traversal."""

import uuid
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.deps import WorkspaceContext, verify_workspace_access
from backend.app.db.session import get_db
from backend.app.models.document import DocumentChunk
from backend.app.schemas.graph import (
    GraphDataResponse,
    GraphExtractionRequest,
    GraphExtractionResponse,
    TraversalRequest,
    TraversalResponse,
)
from backend.app.services.graph_engine import RealGraphEngine

router = APIRouter()


@router.get(
    "/{workspace_id}/graph",
    response_model=GraphDataResponse,
    summary="Fetch Workspace Knowledge Graph (Multi-Tenant Isolated)",
)
async def get_workspace_knowledge_graph(
    workspace_id: uuid.UUID,
    context: WorkspaceContext = Depends(verify_workspace_access),
) -> Any:
    """Retrieve full knowledge graph nodes, edges, and metrics for the workspace."""
    engine = RealGraphEngine(workspace_id)
    return engine.get_graph_data()


@router.post(
    "/{workspace_id}/graph/extract",
    response_model=GraphExtractionResponse,
    summary="Extract Knowledge Graph Entities & Relations from Document Chunks",
)
async def extract_graph_from_chunks(
    workspace_id: uuid.UUID,
    request: GraphExtractionRequest,
    context: WorkspaceContext = Depends(verify_workspace_access),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Extract entities and semantic relationships (triples) from ingested document chunks or raw text.
    Persists nodes and edges into the workspace knowledge graph and synchronizes with Neo4j.
    """
    engine = RealGraphEngine(workspace_id)
    all_triples = []

    if request.raw_text:
        triples = engine.extract_from_text(request.raw_text, chunk_id="custom-input")
        all_triples.extend(triples)
    elif request.document_id:
        # Fetch document chunks from DB
        stmt = (
            select(DocumentChunk)
            .where(
                DocumentChunk.workspace_id == workspace_id,
                DocumentChunk.document_id == request.document_id,
            )
            .order_by(DocumentChunk.chunk_index.asc())
        )
        result = await db.execute(stmt)
        chunks = result.scalars().all()
        if not chunks:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No chunks found for this document",
            )

        for chunk in chunks:
            triples = engine.extract_from_text(chunk.content, chunk_id=f"chunk-{chunk.chunk_index + 1}")
            all_triples.extend(triples)
    else:
        # Extract from all available chunks in workspace
        stmt = (
            select(DocumentChunk)
            .where(DocumentChunk.workspace_id == workspace_id)
            .limit(20)
        )
        result = await db.execute(stmt)
        chunks = result.scalars().all()
        for chunk in chunks:
            triples = engine.extract_from_text(chunk.content, chunk_id=f"chunk-{chunk.chunk_index + 1}")
            all_triples.extend(triples)

    updated_graph = engine.get_graph_data()

    return GraphExtractionResponse(
        extracted_nodes_count=len(updated_graph.nodes),
        extracted_edges_count=len(updated_graph.edges),
        triples=all_triples,
        graph=updated_graph,
    )


@router.post(
    "/{workspace_id}/graph/traverse",
    response_model=TraversalResponse,
    summary="Execute Real Multi-Hop Pathfinding Traversal across Graph",
)
async def traverse_knowledge_graph(
    workspace_id: uuid.UUID,
    request: TraversalRequest,
    context: WorkspaceContext = Depends(verify_workspace_access),
) -> Any:
    """
    Discover multi-hop relational paths connecting concepts in the knowledge graph.
    Demonstrates true GraphRAG reasoning by connecting isolated entities across hops.
    """
    engine = RealGraphEngine(workspace_id)
    return engine.traverse_multi_hop(
        source=request.source_entity,
        target=request.target_entity,
        query=request.query,
        max_depth=request.max_depth,
    )
