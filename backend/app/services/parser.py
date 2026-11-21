"""Document Parsers for PDF, TXT, and Markdown."""

import io
import re
from typing import List, Tuple
from pypdf import PdfReader


def clean_text(text: str) -> str:
    """Clean and normalize extracted raw text."""
    if not text:
        return ""
    # Replace carriage returns
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Replace multiple consecutive spaces while preserving single newlines
    text = re.sub(r"[ \t]+", " ", text)
    # Collapse 3+ consecutive newlines into 2 (paragraph break)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def parse_pdf(file_bytes: bytes) -> List[Tuple[int, str]]:
    """
    Extract text page by page from PDF.
    Returns list of (page_number, page_text).
    """
    reader = PdfReader(io.BytesIO(file_bytes))
    results: List[Tuple[int, str]] = []

    for idx, page in enumerate(reader.pages, start=1):
        try:
            raw_text = page.extract_text() or ""
            cleaned = clean_text(raw_text)
            if cleaned:
                results.append((idx, cleaned))
        except Exception:
            continue

    return results


def parse_text_or_markdown(file_bytes: bytes) -> List[Tuple[int, str]]:
    """Extract and clean plain text or Markdown."""
    try:
        content = file_bytes.decode("utf-8")
    except UnicodeDecodeError:
        content = file_bytes.decode("latin-1", errors="replace")

    cleaned = clean_text(content)
    if cleaned:
        return [(1, cleaned)]
    return []


def parse_document(file_bytes: bytes, file_type: str) -> List[Tuple[int, str]]:
    """Dispatch to proper parser based on file extension."""
    norm_type = file_type.lower().lstrip(".")
    if norm_type == "pdf":
        return parse_pdf(file_bytes)
    elif norm_type in ["txt", "md", "markdown"]:
        return parse_text_or_markdown(file_bytes)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")

