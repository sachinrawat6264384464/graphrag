"""Pydantic schemas for GraphRAG operations."""

import uuid
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class GraphNodeSchema(BaseModel):
    """Knowledge graph entity node."""
    id: str
    name: str
    type: str = "Concept"
    description: Optional[str] = None
    degree: int = 0
    community_id: Optional[int] = None
    color: Optional[str] = None
    x: Optional[float] = None
    y: Optional[float] = None


class GraphEdgeSchema(BaseModel):
    """Knowledge graph relationship edge."""
    id: str
    source: str
    target: str
    predicate: str
    description: Optional[str] = None
    confidence: float = Field(default=0.9, ge=0.0, le=1.0)
    chunk_id: Optional[str] = None


class GraphStatsSchema(BaseModel):
    """High level graph metrics."""
    total_nodes: int
    total_edges: int
    entity_types: Dict[str, int]
    density: float = 0.0
    connected_components: int = 1


class GraphDataResponse(BaseModel):
    """Full knowledge graph payload."""
    nodes: List[GraphNodeSchema]
    edges: List[GraphEdgeSchema]
    stats: GraphStatsSchema


class GraphExtractionRequest(BaseModel):
    """Request to extract graph from chunks or text."""
    document_id: Optional[uuid.UUID] = None
    raw_text: Optional[str] = None


class GraphExtractionResponse(BaseModel):
    """Results of entity & relation extraction."""
    extracted_nodes_count: int
    extracted_edges_count: int
    triples: List[Dict[str, Any]]
    graph: GraphDataResponse


class TraversalRequest(BaseModel):
    """Multi-hop traversal request."""
    source_entity: Optional[str] = None
    target_entity: Optional[str] = None
    query: Optional[str] = None
    max_depth: int = 2


class TraversalResponse(BaseModel):
    """Multi-hop path and sub-graph context."""
    found: bool
    path_nodes: List[str]
    path_edges: List[Dict[str, Any]]
    sub_graph: GraphDataResponse
    reasoning: str
    provenance_chunks: List[Dict[str, Any]]
