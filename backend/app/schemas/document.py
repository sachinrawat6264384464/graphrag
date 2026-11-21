"""Document & Chunk Pydantic Schemas."""

import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from backend.app.models.document import DocumentStatus


class DocumentBase(BaseModel):
    """Base document fields."""

    title: str
    filename: str
    file_type: str
    file_size_bytes: int


class DocumentResponse(DocumentBase):
    """Document record schema."""

    id: uuid.UUID
    workspace_id: uuid.UUID
    status: DocumentStatus
    total_chunks: int
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DocumentChunkResponse(BaseModel):
    """Single document chunk with provenance metadata."""

    id: uuid.UUID
    document_id: uuid.UUID
    chunk_index: int
    content: str
    token_count: int
    page_number: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class DocumentDetailResponse(DocumentResponse):
    """Detailed document response including extracted chunks."""

    chunks: List[DocumentChunkResponse] = []

    model_config = {"from_attributes": True}

