"use client";

import { useState, useRef } from "react";
import { DocumentItem, DocumentChunk, fetchDocumentDetailsApi, uploadDocumentApi, deleteDocumentApi } from "@/lib/api";
import {
  Upload,
  FileText,
  FileCode,
  Trash2,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  X,
  FileUp,
} from "lucide-react";

interface DocumentsViewProps {
  documents: DocumentItem[];
  workspaceId: string | null;
  token: string | null;
  onRefresh: () => void;
  onOpenAuth: () => void;
}

export function DocumentsView({
  documents,
  workspaceId,
  token,
  onRefresh,
  onOpenAuth,
}: DocumentsViewProps) {
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [isChunkModalOpen, setIsChunkModalOpen] = useState(false);
  const [loadingChunks, setLoadingChunks] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInspectChunks = async (doc: DocumentItem) => {
    setSelectedDoc(doc);
    setIsChunkModalOpen(true);
    if (!token || !workspaceId) return;

    setLoadingChunks(true);
    try {
      const details = await fetchDocumentDetailsApi(workspaceId, doc.id, token);
      setSelectedDoc(details);
    } catch {
      // Keep existing doc state
    } finally {
      setLoadingChunks(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!token || !workspaceId) return;
    if (!confirm("Are you sure you want to delete this document and all its chunks?")) return;

    try {
      await deleteDocumentApi(workspaceId, docId, token);
      setSuccessMessage("Document deleted successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
      onRefresh();
    } catch (err: any) {
      setUploadError(err.message || "Failed to delete document");
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!token || !workspaceId) {
      onOpenAuth();
      return;
    }

    setUploading(true);
    setUploadError(null);
    try {
      await uploadDocumentApi(workspaceId, file, token);
      setSuccessMessage(`"${file.name}" uploaded successfully! Chunking in progress.`);
      setTimeout(() => setSuccessMessage(null), 4000);
      onRefresh();
    } catch (err: any) {
      setUploadError(err.message || "Upload failed. Please verify format (PDF, TXT, MD) and size.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleUploadSampleDoc = async () => {
    const sampleText = `# NexusAI Enterprise Platform Architecture

## Executive Summary
NexusAI unifies dense semantic search, exact keyword matching, and property graph traversal to deliver zero-hallucination RAG intelligence.

## Multi-Tenant Security
Every workspace represents an isolated data boundary. Documents and chunks belong exclusively to their provisioned tenant. RBAC roles (Platform Admin, Workspace Admin, Editor, Viewer) restrict ingestion and retrieval access.

## Document Ingestion & Chunking
1. Document Parsing: Extracts text and metadata from PDF, TXT, and Markdown files.
2. Token-Bounded Chunking: Recursive chunker breaks documents into 1,000 token passages with 150 token sliding overlap.
3. Content Hash Deduplication: Uses SHA-256 to ensure idempotent uploads without duplicate storage.

## Hybrid Fusion Strategy
Dense semantic embeddings capture conceptual meaning via HNSW index in PostgreSQL pgvector. Sparse lexical search captures exact terminology via BM25/trigrams. Reciprocal Rank Fusion (RRF) mathematically fuses candidate rankings before sending to the cross-encoder re-ranker.
`;
    const blob = new Blob([sampleText], { type: "text/markdown" });
    const sampleFile = new File([blob], "nexusai_architecture_sample.md", { type: "text/markdown" });
    await handleFileUpload(sampleFile);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Document Ingestion & Chunking</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Upload PDFs, Markdown, or Text documents. NexusAI parses, normalizes, and chunks them for hybrid RAG.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            title="Refresh documents list"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-surface hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 text-accent" />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-accent text-white hover:bg-accent/90 transition-all cursor-pointer shadow-sm disabled:opacity-60"
          >
            <Upload className="h-4 w-4" />
            <span>{uploading ? "Ingesting..." : "Upload Document"}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md,.markdown"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Banner Alerts */}
      {uploadError && (
        <div className="flex items-center justify-between p-3.5 rounded-lg bg-status-error/10 border border-status-error/30 text-status-error text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button onClick={() => setUploadError(null)} className="cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Auth Prompt if not logged in */}
      {!token && (
        <div className="rounded-xl border border-accent/40 bg-accent/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/15 text-accent">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Sign In to Ingest Custom Documents</h4>
              <p className="text-[11px] text-muted-foreground">
                Your documents will be saved in your private workspace with multi-tenant data isolation.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAuth}
            className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-accent text-white hover:bg-accent/90 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
          >
            Sign In / Register
          </button>
        </div>
      )}

      {/* Upload Zone / Drag & Drop Card */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="group relative rounded-xl border-2 border-dashed border-border hover:border-accent/60 bg-surface/50 hover:bg-surface-muted/60 p-8 text-center transition-all cursor-pointer space-y-3"
      >
        <div className="mx-auto h-12 w-12 rounded-xl bg-surface-muted group-hover:bg-accent/10 border border-border group-hover:border-accent/30 flex items-center justify-center transition-colors">
          <FileUp className="h-6 w-6 text-muted-foreground group-hover:text-accent transition-colors" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-foreground">
            Click or drag & drop to ingest a document
          </h4>
          <p className="text-xs text-muted-foreground">
            Supports <span className="font-medium text-foreground">PDF</span>, <span className="font-medium text-foreground">Markdown (.md)</span>, and <span className="font-medium text-foreground">Plain Text (.txt)</span> up to 50MB
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground pt-1">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-accent" /> Auto SHA-256 Deduplication
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-accent" /> 1000 Token Chunker + 150 Overlap
          </span>
        </div>
      </div>

      {/* Ingested Documents List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Workspace Ingested Documents ({documents.length})
          </h3>
          {documents.length === 0 && (
            <button
              onClick={handleUploadSampleDoc}
              disabled={uploading}
              className="text-xs font-medium text-accent hover:underline cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Generate Sample Document</span>
            </button>
          )}
        </div>

        {documents.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-10 text-center space-y-3">
            <div className="mx-auto h-10 w-10 rounded-full bg-surface-muted flex items-center justify-center text-muted-foreground">
              <FileText className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">No Documents Ingested Yet</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Upload your research paper, technical manual, or markdown documentation to begin extracting knowledge chunks.
              </p>
            </div>
            <button
              onClick={handleUploadSampleDoc}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-muted hover:bg-surface border border-border text-foreground transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span>Load 1-Click Architecture Sample Document</span>
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface-muted/60 text-muted-foreground font-medium">
                    <th className="py-3 px-4">Document Title</th>
                    <th className="py-3 px-4">Format</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Chunks</th>
                    <th className="py-3 px-4">Ingested At</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-surface-muted/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded bg-surface-muted text-accent shrink-0">
                            {doc.file_type === "pdf" ? (
                              <FileText className="h-4 w-4" />
                            ) : (
                              <FileCode className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground block">{doc.title}</span>
                            <span className="text-[11px] text-muted-foreground">{doc.filename}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-surface-muted border border-border text-muted-foreground">
                          {doc.file_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {(doc.file_size_bytes / 1024).toFixed(1)} KB
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium capitalize border ${
                            doc.status === "ready"
                              ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                              : doc.status === "parsing" || doc.status === "chunking" || doc.status === "uploaded"
                              ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
                              : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                          }`}
                        >
                          {doc.status === "ready" ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : doc.status === "failed" ? (
                            <AlertCircle className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3 animate-spin" />
                          )}
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        {doc.total_chunks} chunks
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString()} {new Date(doc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleInspectChunks(doc)}
                            title="Inspect Text Chunks"
                            className="p-1.5 rounded-md hover:bg-surface-muted text-muted-foreground hover:text-accent transition-colors cursor-pointer"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            title="Delete Document"
                            className="p-1.5 rounded-md hover:bg-surface-muted text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Chunk Inspection Modal */}
      {isChunkModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-3xl rounded-xl border border-border bg-surface shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-muted/50">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-accent" />
                  <h3 className="font-bold text-sm text-foreground">
                    Chunks Inspection: {selectedDoc.title}
                  </h3>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {selectedDoc.total_chunks} recursive chunks extracted • 1000 token bounding • 150 token overlap
                </p>
              </div>
              <button
                onClick={() => setIsChunkModalOpen(false)}
                className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingChunks ? (
                <div className="py-12 text-center space-y-2 text-muted-foreground">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto text-accent" />
                  <p className="text-xs">Loading chunk records from database...</p>
                </div>
              ) : selectedDoc.chunks && selectedDoc.chunks.length > 0 ? (
                selectedDoc.chunks.map((chunk, idx) => (
                  <div
                    key={chunk.id || idx}
                    className="p-4 rounded-lg border border-border bg-surface-muted/40 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-accent">
                        Chunk #{chunk.chunk_index + 1}
                      </span>
                      <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                        {chunk.page_number && <span>Page {chunk.page_number}</span>}
                        <span>~{chunk.token_count} tokens</span>
                      </div>
                    </div>
                    <pre className="text-xs text-foreground font-mono bg-surface p-3 rounded border border-border whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                      {chunk.content}
                    </pre>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-muted-foreground space-y-2">
                  <AlertCircle className="h-6 w-6 mx-auto text-yellow-500" />
                  <p className="text-xs">
                    No chunk records found. The document might still be parsing in the background.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-border bg-surface-muted/50 flex justify-end">
              <button
                onClick={() => setIsChunkModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold border border-border bg-surface hover:bg-surface-muted cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
