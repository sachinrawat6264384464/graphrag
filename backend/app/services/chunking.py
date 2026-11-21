"""Recursive Text Chunker with Overlap and Metadata Preservation."""

from dataclasses import dataclass
from typing import List, Optional


@dataclass
class ChunkItem:
    """Represents a generated chunk with provenance."""

    content: str
    chunk_index: int
    token_count: int
    page_number: Optional[int] = None


class RecursiveChunker:
    """Splits text recursively by semantic separators with overlap."""

    def __init__(
        self,
        chunk_size: int = 1000,
        chunk_overlap: int = 150,
        separators: Optional[List[str]] = None,
    ):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.separators = separators or ["\n\n", "\n", ". ", " ", ""]

    def estimate_tokens(self, text: str) -> int:
        """Estimate token count (~4 characters per token)."""
        return max(1, len(text) // 4)

    def _split_text(self, text: str, separators: List[str]) -> List[str]:
        """Split text recursively using current separator."""
        if len(text) <= self.chunk_size or not separators:
            return [text] if text.strip() else []

        sep = separators[0]
        remaining_seps = separators[1:]

        if sep == "":
            # Fallback to hard character slicing
            return [
                text[i : i + self.chunk_size]
                for i in range(0, len(text), self.chunk_size - self.chunk_overlap)
            ]

        splits = text.split(sep)
        chunks: List[str] = []
        current_chunk = ""

        for part in splits:
            candidate = f"{current_chunk}{sep}{part}" if current_chunk else part
            if len(candidate) <= self.chunk_size:
                current_chunk = candidate
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                if len(part) > self.chunk_size:
                    # Recurse on remaining finer separators
                    sub_chunks = self._split_text(part, remaining_seps)
                    chunks.extend(sub_chunks)
                    current_chunk = ""
                else:
                    current_chunk = part

        if current_chunk:
            chunks.append(current_chunk.strip())

        return [c for c in chunks if c]

    def chunk_document_pages(
        self, pages: List[tuple[int, str]]
    ) -> List[ChunkItem]:
        """Chunk a list of (page_number, text) tuples with sequential indexing."""
        all_chunks: List[ChunkItem] = []
        global_index = 0

        for page_num, text in pages:
            raw_chunks = self._split_text(text, self.separators)
            for chunk_str in raw_chunks:
                if not chunk_str.strip():
                    continue
                all_chunks.append(
                    ChunkItem(
                        content=chunk_str,
                        chunk_index=global_index,
                        token_count=self.estimate_tokens(chunk_str),
                        page_number=page_num,
                    )
                )
                global_index += 1

        return all_chunks

