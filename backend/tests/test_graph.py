"""Unit and Integration Tests for GraphRAG Engine and API Endpoints."""

import uuid
import pytest
from httpx import AsyncClient
from backend.app.services.graph_engine import RealGraphEngine


@pytest.fixture
def test_ws_id() -> uuid.UUID:
    return uuid.uuid4()


def test_real_graph_engine_seed_and_serialize(test_ws_id: uuid.UUID):
    """Verify default graph is created with nodes, edges, and valid SVG coordinates."""
    engine = RealGraphEngine(test_ws_id)
    graph_data = engine.get_graph_data()

    assert graph_data.stats.total_nodes > 5
    assert graph_data.stats.total_edges > 5
    assert any(n.name == "NexusAI" for n in graph_data.nodes)
    assert any(n.name == "PostgreSQL" for n in graph_data.nodes)
    assert any(n.name == "pgvector" for n in graph_data.nodes)

    # Check SVG coordinates
    for node in graph_data.nodes:
        assert node.x is not None
        assert node.y is not None


def test_graph_entity_extraction(test_ws_id: uuid.UUID):
    """Verify text extractor extracts entities and relationships."""
    engine = RealGraphEngine(test_ws_id)
    sample_text = (
        "NexusAI uses PostgreSQL for metadata storage. "
        "PostgreSQL enables pgvector which stores dense vector embeddings. "
        "NexusAI integrates with Neo4j to store knowledge triples."
    )
    triples = engine.extract_from_text(sample_text, chunk_id="test-chunk-1")

    assert len(triples) >= 2
    subjects = [t["subject"] for t in triples]
    objects = [t["object"] for t in triples]
    assert "NexusAI" in subjects or "NexusAI" in objects
    assert "PostgreSQL" in subjects or "PostgreSQL" in objects


def test_graph_multi_hop_traversal(test_ws_id: uuid.UUID):
    """Verify shortest path multi-hop traversal and explanation generation."""
    engine = RealGraphEngine(test_ws_id)
    traversal = engine.traverse_multi_hop(
        source="NexusAI",
        target="Dense Semantic Retrieval",
        max_depth=3,
    )

    assert traversal.found is True
    assert len(traversal.path_nodes) >= 2
    assert "NexusAI" in traversal.path_nodes
    assert "Dense Semantic Retrieval" in traversal.path_nodes
    assert "Multi-hop GraphRAG Traversal successful" in traversal.reasoning


@pytest.mark.asyncio
async def test_graph_api_endpoints(async_client: AsyncClient):
    """Verify authenticated REST endpoints for graph operations."""
    # Register test user
    email = f"graph_user_{uuid.uuid4().hex[:8]}@example.com"
    reg = await async_client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "Password123!", "full_name": "Graph Tester"},
    )
    assert reg.status_code == 201
    auth_data = reg.json()
    token = auth_data["token"]["access_token"]
    ws_id = auth_data["workspace"]["id"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. GET /graph
    res_get = await async_client.get(f"/api/v1/workspaces/{ws_id}/graph", headers=headers)
    assert res_get.status_code == 200
    graph_res = res_get.json()
    assert len(graph_res["nodes"]) > 0
    assert len(graph_res["edges"]) > 0

    # 2. POST /graph/extract with raw_text
    extract_res = await async_client.post(
        f"/api/v1/workspaces/{ws_id}/graph/extract",
        headers=headers,
        json={"raw_text": "NexusAI stores Knowledge Triples in Neo4j to enable GraphRAG Traversal."},
    )
    assert extract_res.status_code == 200
    extract_data = extract_res.json()
    assert extract_data["extracted_nodes_count"] > 0
    assert len(extract_data["triples"]) > 0

    # 3. POST /graph/traverse
    trav_res = await async_client.post(
        f"/api/v1/workspaces/{ws_id}/graph/traverse",
        headers=headers,
        json={"source_entity": "NexusAI", "target_entity": "GraphRAG Traversal"},
    )
    assert trav_res.status_code == 200
    trav_data = trav_res.json()
    assert trav_data["found"] is True
    assert len(trav_data["path_nodes"]) >= 2
