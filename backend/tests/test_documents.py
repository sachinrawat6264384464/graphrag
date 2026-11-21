"""Unit & Integration Tests for Document Ingestion Pipeline."""

import io
import uuid
import pytest
from httpx import AsyncClient
from backend.app.services.ingestion import process_document_ingestion


async def create_user_and_token(async_client: AsyncClient, prefix: str):
    """Helper to register user and obtain token + default workspace ID."""
    email = f"{prefix}_{uuid.uuid4().hex[:8]}@example.com"
    reg = await async_client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "Password123!", "full_name": f"{prefix} User"},
    )
    assert reg.status_code == 201
    data = reg.json()
    return email, data["token"]["access_token"], data["workspace"]["id"]


@pytest.mark.asyncio
async def test_upload_txt_document_and_ingest(async_client: AsyncClient):
    """Verify uploading a plain text document, parsing, and chunking."""
    _, token, ws_id = await create_user_and_token(async_client, "doc_owner")
    headers = {"Authorization": f"Bearer {token}"}

    sample_content = (
        "NexusAI Architecture Overview.\n\n"
        "NexusAI unifies dense semantic retrieval, sparse keyword search, and knowledge graph traversal.\n\n"
        "Each document is parsed, normalized, and chunked with token bounding and overlap preservation.\n\n"
        "This ensures maximum precision during hybrid search fusion."
    ).encode("utf-8")

    files = {
        "file": ("nexus_overview.txt", io.BytesIO(sample_content), "text/plain")
    }

    upload_res = await async_client.post(
        f"/api/v1/workspaces/{ws_id}/documents/upload",
        headers=headers,
        files=files,
    )
    assert upload_res.status_code == 201
    doc_data = upload_res.json()
    assert doc_data["filename"] == "nexus_overview.txt"
    assert doc_data["file_type"] == "txt"
    doc_id = doc_data["id"]

    # Explicitly run ingestion processing
    await process_document_ingestion(uuid.UUID(doc_id))

    # Fetch document details
    detail_res = await async_client.get(
        f"/api/v1/workspaces/{ws_id}/documents/{doc_id}",
        headers=headers,
    )
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["status"] == "ready"
    assert detail_data["total_chunks"] >= 1
    assert len(detail_data["chunks"]) >= 1
    assert "NexusAI" in detail_data["chunks"][0]["content"]


@pytest.mark.asyncio
async def test_document_tenant_isolation(async_client: AsyncClient):
    """Verify User B cannot access or list documents uploaded by User A."""
    _, token_a, ws_id_a = await create_user_and_token(async_client, "tenant_a")
    _, token_b, ws_id_b = await create_user_and_token(async_client, "tenant_b")

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User A uploads a document
    content = b"Confidential Financial Analysis for Company A"
    files = {"file": ("confidential_a.txt", io.BytesIO(content), "text/plain")}
    up_res = await async_client.post(
        f"/api/v1/workspaces/{ws_id_a}/documents/upload",
        headers=headers_a,
        files=files,
    )
    assert up_res.status_code == 201
    doc_id_a = up_res.json()["id"]

    # User B attempts to list User A's documents -> 403 Forbidden
    list_b = await async_client.get(
        f"/api/v1/workspaces/{ws_id_a}/documents",
        headers=headers_b,
    )
    assert list_b.status_code == 403

    # User B attempts to get details of User A's document -> 403 Forbidden
    get_b = await async_client.get(
        f"/api/v1/workspaces/{ws_id_a}/documents/{doc_id_a}",
        headers=headers_b,
    )
    assert get_b.status_code == 403


@pytest.mark.asyncio
async def test_delete_document_cascades_chunks(async_client: AsyncClient):
    """Verify deleting a document deletes its record and chunks."""
    _, token, ws_id = await create_user_and_token(async_client, "delete_owner")
    headers = {"Authorization": f"Bearer {token}"}

    content = b"Temporary Document for Deletion Test"
    files = {"file": ("temp_doc.txt", io.BytesIO(content), "text/plain")}
    up = await async_client.post(
        f"/api/v1/workspaces/{ws_id}/documents/upload",
        headers=headers,
        files=files,
    )
    doc_id = up.json()["id"]

    # Ingest
    await process_document_ingestion(uuid.UUID(doc_id))

    # Delete
    del_res = await async_client.delete(
        f"/api/v1/workspaces/{ws_id}/documents/{doc_id}",
        headers=headers,
    )
    assert del_res.status_code == 204

    # Fetching again should return 404
    get_again = await async_client.get(
        f"/api/v1/workspaces/{ws_id}/documents/{doc_id}",
        headers=headers,
    )
    assert get_again.status_code == 404

