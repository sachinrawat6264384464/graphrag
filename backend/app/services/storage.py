"""Local File Storage Adapter."""

import hashlib
import os
import uuid
from pathlib import Path
from typing import Tuple
from backend.app.core.config import settings

# Base upload directory
BASE_STORAGE_PATH = Path(settings.LOCAL_STORAGE_DIR).resolve()


def ensure_storage_dir(workspace_id: uuid.UUID) -> Path:
    """Create tenant-isolated directory if it does not exist."""
    tenant_dir = BASE_STORAGE_PATH / str(workspace_id)
    tenant_dir.mkdir(parents=True, exist_ok=True)
    return tenant_dir


def save_file_content(
    workspace_id: uuid.UUID,
    filename: str,
    content: bytes,
) -> Tuple[str, str, int]:
    """
    Save uploaded bytes into tenant-isolated storage path.
    Returns: (relative_storage_path, sha256_hash, file_size_bytes)
    """
    # Calculate SHA256 content hash for deduplication/idempotency
    content_hash = hashlib.sha256(content).hexdigest()
    file_size = len(content)

    # Retain extension
    ext = os.path.splitext(filename)[1].lower()
    safe_filename = f"{content_hash[:16]}{ext}"

    tenant_dir = ensure_storage_dir(workspace_id)
    destination = tenant_dir / safe_filename

    # Save to disk
    with open(destination, "wb") as f:
        f.write(content)

    relative_path = str(destination.relative_to(BASE_STORAGE_PATH.parent))
    return relative_path, content_hash, file_size


def read_file_content(storage_path: str) -> bytes:
    """Read file bytes from disk given relative storage path."""
    full_path = (BASE_STORAGE_PATH.parent / storage_path).resolve()
    if not full_path.exists():
        raise FileNotFoundError(f"Stored file not found: {storage_path}")
    with open(full_path, "rb") as f:
        return f.read()


def delete_file_content(storage_path: str) -> bool:
    """Delete physical file from disk."""
    try:
        full_path = (BASE_STORAGE_PATH.parent / storage_path).resolve()
        if full_path.exists():
            full_path.unlink()
            return True
        return False
    except Exception:
        return False

