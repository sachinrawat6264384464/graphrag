"""Unit & Integration Tests for User Authentication & Token Operations."""

import uuid
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_and_auto_provision_workspace(async_client: AsyncClient):
    """Verify user registration automatically provisions a default personal workspace and returns JWT."""
    unique_email = f"user_{uuid.uuid4().hex[:8]}@example.com"
    payload = {
        "email": unique_email,
        "password": "StrongPassword123!",
        "full_name": "Test Engineer",
    }
    response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()

    # Verify user structure
    assert "user" in data
    assert data["user"]["email"] == unique_email
    assert data["user"]["full_name"] == "Test Engineer"
    assert data["user"]["is_active"] is True
    assert "id" in data["user"]

    # Verify auto-provisioned workspace
    assert "workspace" in data
    assert "Workspace" in data["workspace"]["name"]
    assert "slug" in data["workspace"]

    # Verify JWT token
    assert "token" in data
    assert data["token"]["token_type"] == "bearer"
    assert len(data["token"]["access_token"]) > 20


@pytest.mark.asyncio
async def test_register_duplicate_email_fails(async_client: AsyncClient):
    """Verify registration fails when email is already registered."""
    unique_email = f"dup_{uuid.uuid4().hex[:8]}@example.com"
    payload = {
        "email": unique_email,
        "password": "Password123!",
    }
    r1 = await async_client.post("/api/v1/auth/register", json=payload)
    assert r1.status_code == 201

    r2 = await async_client.post("/api/v1/auth/register", json=payload)
    assert r2.status_code == 400
    assert "already exists" in r2.json()["detail"]


@pytest.mark.asyncio
async def test_login_success_and_failure(async_client: AsyncClient):
    """Verify login authentication with correct and incorrect credentials."""
    email = f"login_{uuid.uuid4().hex[:8]}@example.com"
    password = "CorrectPassword123!"

    # Register first
    await async_client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password},
    )

    # Login with correct password
    res_ok = await async_client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert res_ok.status_code == 200
    token_data = res_ok.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"

    # Login with wrong password
    res_fail = await async_client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "WrongPassword!"},
    )
    assert res_fail.status_code == 401
    assert "Incorrect email or password" in res_fail.json()["detail"]


@pytest.mark.asyncio
async def test_get_my_profile_with_jwt(async_client: AsyncClient):
    """Verify /auth/me returns authenticated user profile and workspaces."""
    email = f"me_{uuid.uuid4().hex[:8]}@example.com"
    password = "Password123!"

    reg = await async_client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": "Profile Owner"},
    )
    token = reg.json()["token"]["access_token"]

    # Call /auth/me with Bearer token
    headers = {"Authorization": f"Bearer {token}"}
    res = await async_client.get("/api/v1/auth/me", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["user"]["email"] == email
    assert len(data["workspaces"]) >= 1
    assert data["workspaces"][0]["current_user_role"] == "workspace_admin"

    # Unauthenticated call should fail
    res_unauth = await async_client.get("/api/v1/auth/me")
    assert res_unauth.status_code == 401

