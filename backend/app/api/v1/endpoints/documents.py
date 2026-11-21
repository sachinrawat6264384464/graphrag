"""Document Management and Upload Endpoints."""

import os
import uuid
from typing import Any, List
from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.api.deps import (
    WorkspaceContext,
    require_workspace_roles,
    verify_workspace_access,
)
from backend.app.core.config import settings
from backend.app.db.session import get_db
from backend.app.models.document import Document, DocumentStatus
from backend.app.models.workspace import WorkspaceRole
from backend.app.schemas.document import DocumentDetailResponse, DocumentResponse
from backend.app.services.ingestion import process_document_ingestion
from backend.app.services.storage import delete_file_content, save_file_content

router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md", ".markdown"}
MAX_FILE_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


@router.post(
    "/{workspace_id}/documents/upload",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload Document to Workspace & Trigger Async Ingestion",
)
async def upload_document(
    workspace_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    context: WorkspaceContext = Depends(
        require_workspace_roles([
            WorkspaceRole.WORKSPACE_ADMIN,
            WorkspaceRole.EDITOR,
        ])
    ),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Upload PDF, TXT, or Markdown document to workspace.
    Validates file format, size, computes SHA256 content hash,
    and initiates asynchronous parsing and chunking pipeline.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is missing",
        )

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Allowed types: {sorted(ALLOWED_EXTENSIONS)}",
        )

    # Read bytes and validate size
    content = await file.read()
    if len(content) > MAX_FILE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum upload limit of {settings.MAX_UPLOAD_SIZE_MB}MB",
        )
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty",
        )

    # Save physical file using storage adapter
    relative_path, content_hash, file_size = save_file_content(
        workspace_id=workspace_id,
        filename=file.filename,
        content=content,
    )

    # Clean title from filename
    title = os.path.splitext(file.filename)[0].replace("_", " ").replace("-", " ").title()

    # Create Document record
    document = Document(
        workspace_id=workspace_id,
        title=title,
        filename=file.filename,
        file_type=ext.lstrip("."),
        file_size_bytes=file_size,
        storage_path=relative_path,
        content_hash=content_hash,
        status=DocumentStatus.QUEUED,
        total_chunks=0,
    )
    db.add(document)
    await db.commit()
    await db.refresh(document)

    # Dispatch asynchronous background ingestion (parse -> clean -> chunk)
    background_tasks.add_task(process_document_ingestion, document.id)

    return DocumentResponse.model_validate(document)


@router.get(
    "/{workspace_id}/documents",
    response_model=List[DocumentResponse],
    summary="List Workspace Documents (Tenant Isolated)",
)
async def list_workspace_documents(
    workspace_id: uuid.UUID,
    context: WorkspaceContext = Depends(verify_workspace_access),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """List all documents belonging to the workspace tenant."""
    result = await db.execute(
        select(Document)
        .where(Document.workspace_id == workspace_id)
        .order_by(Document.created_at.desc())
    )
    docs = result.scalars().all()
    return [DocumentResponse.model_validate(d) for d in docs]


@router.get(
    "/{workspace_id}/documents/{document_id}",
    response_model=DocumentDetailResponse,
    summary="Get Document and its Chunks",
)
async def get_document_details(
    workspace_id: uuid.UUID,
    document_id: uuid.UUID,
    context: WorkspaceContext = Depends(verify_workspace_access),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Retrieve document metadata and all generated text chunks."""
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.workspace_id == workspace_id,
        )
    )
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found in this workspace",
        )

    return DocumentDetailResponse.model_validate(doc)


@router.delete(
    "/{workspace_id}/documents/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Document and Associated Chunks",
)
async def delete_document(
    workspace_id: uuid.UUID,
    document_id: uuid.UUID,
    context: WorkspaceContext = Depends(
        require_workspace_roles([
            WorkspaceRole.WORKSPACE_ADMIN,
            WorkspaceRole.EDITOR,
        ])
    ),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete document, underlying disk file, and cascade delete all chunks."""
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.workspace_id == workspace_id,
        )
    )
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found in this workspace",
        )

    # Delete physical file
    delete_file_content(doc.storage_path)

    # Delete from DB (chunks cascade automatically)
    await db.delete(doc)
    await db.commit()

