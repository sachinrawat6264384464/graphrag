"""Unit & Integration Tests for Multi-Tenant Workspaces & RBAC Isolation."""

import uuid
import pytest
from httpx import AsyncClient


async def create_user_and_token(async_client: AsyncClient, prefix: str):
    """Helper to create a user and return (email, token, default_workspace_id)."""
    email = f"{prefix}_{uuid.uuid4().hex[:8]}@example.com"
    reg = await async_client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "Password123!", "full_name": f"{prefix} User"},
    )
    assert reg.status_code == 201
    data = reg.json()
    return email, data["token"]["access_token"], data["workspace"]["id"]


@pytest.mark.asyncio
async def test_create_and_list_workspaces(async_client: AsyncClient):
    """Verify user can create an additional workspace and list their memberships."""
    _, token, default_ws_id = await create_user_and_token(async_client, "owner")
    headers = {"Authorization": f"Bearer {token}"}

    # Create additional workspace
    ws_name = f"Acme Engineering {uuid.uuid4().hex[:6]}"
    new_ws_payload = {
        "name": ws_name,
        "description": "Engineering Knowledge Base",
    }
    create_res = await async_client.post(
        "/api/v1/workspaces",
        json=new_ws_payload,
        headers=headers,
    )
    assert create_res.status_code == 201
    new_ws = create_res.json()
    assert new_ws["name"] == ws_name
    assert new_ws["current_user_role"] == "workspace_admin"

    # List workspaces
    list_res = await async_client.get("/api/v1/workspaces", headers=headers)
    assert list_res.status_code == 200
    workspaces = list_res.json()
    assert len(workspaces) >= 2  # default personal + Acme Engineering


@pytest.mark.asyncio
async def test_multi_tenant_isolation(async_client: AsyncClient):
    """CRITICAL SECURITY TEST: Verify User A cannot access User B's workspace."""
    _, token_a, ws_id_a = await create_user_and_token(async_client, "user_a")
    _, token_b, ws_id_b = await create_user_and_token(async_client, "user_b")

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User A accesses Workspace A -> OK
    res_a = await async_client.get(f"/api/v1/workspaces/{ws_id_a}", headers=headers_a)
    assert res_a.status_code == 200

    # User B accesses Workspace B -> OK
    res_b = await async_client.get(f"/api/v1/workspaces/{ws_id_b}", headers=headers_b)
    assert res_b.status_code == 200

    # User B attempts to access Workspace A -> 403 Forbidden!
    res_b_on_a = await async_client.get(f"/api/v1/workspaces/{ws_id_a}", headers=headers_b)
    assert res_b_on_a.status_code == 403
    assert "not a member" in res_b_on_a.json()["detail"]


@pytest.mark.asyncio
async def test_workspace_rbac_member_invite(async_client: AsyncClient):
    """Verify workspace admin can invite members with specific roles."""
    email_admin, token_admin, ws_id = await create_user_and_token(async_client, "admin")
    email_member, token_member, _ = await create_user_and_token(async_client, "colleague")

    headers_admin = {"Authorization": f"Bearer {token_admin}"}
    headers_member = {"Authorization": f"Bearer {token_member}"}

    # Before invite, colleague cannot access admin's workspace
    check_before = await async_client.get(f"/api/v1/workspaces/{ws_id}", headers=headers_member)
    assert check_before.status_code == 403

    # Admin invites colleague as 'editor'
    invite_res = await async_client.post(
        f"/api/v1/workspaces/{ws_id}/members",
        json={"email": email_member, "role": "editor"},
        headers=headers_admin,
    )
    assert invite_res.status_code == 201
    assert invite_res.json()["role"] == "editor"
    assert invite_res.json()["email"] == email_member

    # After invite, colleague can access admin's workspace with editor role
    check_after = await async_client.get(f"/api/v1/workspaces/{ws_id}", headers=headers_member)
    assert check_after.status_code == 200
    assert check_after.json()["current_user_role"] == "editor"

