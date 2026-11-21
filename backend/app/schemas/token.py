"""Token and Authentication Schemas."""

from typing import Optional
from pydantic import BaseModel


class Token(BaseModel):
    """JWT bearer token response."""

    access_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenPayload(BaseModel):
    """Decoded JWT payload."""

    sub: str
    exp: int
    iat: Optional[int] = None
    email: Optional[str] = None

