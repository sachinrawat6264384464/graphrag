"""Document Ingestion Orchestration Service."""

import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.logging import logger
from backend.app.db.session import AsyncSessionLocal
from backend.app.models.document import Document, DocumentChunk, DocumentStatus
from backend.app.services.chunking import RecursiveChunker
from backend.app.services.parser import parse_document
from backend.app.services.storage import read_file_content


async def process_document_ingestion(document_id: uuid.UUID) -> None:
    """
    Background worker task to parse, clean, and chunk a document.
    Updates document status progressively: UPLOADED -> PARSING -> CHUNKING -> READY / FAILED.
    """
    async with AsyncSessionLocal() as db:
        try:
            # 1. Fetch document record
            result = await db.execute(select(Document).where(Document.id == document_id))
            doc = result.scalars().first()
            if not doc:
                logger.error(f"Ingestion failed: Document {document_id} not found")
                return

            # 2. Mark PARSING
            doc.status = DocumentStatus.PARSING
            await db.commit()
            logger.info(f"Parsing document {doc.id} ({doc.filename})...")

            file_bytes = read_file_content(doc.storage_path)
            pages = parse_document(file_bytes, doc.file_type)

            if not pages:
                raise ValueError("No readable text could be extracted from this document")

            # 3. Mark CHUNKING
            doc.status = DocumentStatus.CHUNKING
            await db.commit()
            logger.info(f"Chunking document {doc.id} ({len(pages)} pages)...")

            chunker = RecursiveChunker(chunk_size=1000, chunk_overlap=150)
            chunks_data = chunker.chunk_document_pages(pages)

            if not chunks_data:
                raise ValueError("Chunking produced zero valid text chunks")

            # 4. Insert DocumentChunk records
            for item in chunks_data:
                chunk_record = DocumentChunk(
                    workspace_id=doc.workspace_id,
                    document_id=doc.id,
                    chunk_index=item.chunk_index,
                    content=item.content,
                    token_count=item.token_count,
                    page_number=item.page_number,
                )
                db.add(chunk_record)

            # 5. Mark READY
            doc.total_chunks = len(chunks_data)
            doc.status = DocumentStatus.READY
            doc.error_message = None
            await db.commit()
            logger.info(
                f"Document {doc.id} ingestion SUCCESS: {len(chunks_data)} chunks created."
            )

        except Exception as exc:
            logger.exception(f"Document ingestion failed for {document_id}: {exc}")
            try:
                # Reload and mark FAILED
                res_err = await db.execute(select(Document).where(Document.id == document_id))
                failed_doc = res_err.scalars().first()
                if failed_doc:
                    failed_doc.status = DocumentStatus.FAILED
                    failed_doc.error_message = str(exc)
                    await db.commit()
            except Exception:
                pass

