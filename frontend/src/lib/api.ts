/**
 * Typed API Client for NexusAI Backend API
 */

export interface ServiceComponentStatus {
  status: "healthy" | "unhealthy" | "disabled" | "unknown";
  latency_ms: number | null;
  details: string | null;
}

export interface ReadinessResponse {
  status: "healthy" | "degraded" | "unhealthy";
  app_name: string;
  version: string;
  environment: string;
  timestamp: string;
  services: {
    postgres: ServiceComponentStatus;
    neo4j: ServiceComponentStatus;
    redis: ServiceComponentStatus;
  };
}

export interface HealthResponse {
  status: "alive" | "healthy" | "degraded" | "unhealthy";
  app_name: string;
  version: string;
  environment: string;
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_platform_admin: boolean;
  created_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  current_user_role?: string;
}

export interface AuthResponse {
  user: User;
  workspace: Workspace;
  token: {
    access_token: string;
    token_type: string;
    expires_in: number;
  };
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  token_count: number;
  page_number: number | null;
  created_at: string;
}

export interface DocumentItem {
  id: string;
  workspace_id: string;
  title: string;
  filename: string;
  file_type: string;
  file_size_bytes: number;
  status: string;
  total_chunks: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  chunks?: DocumentChunk[];
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Fetch detailed readiness across backing databases.
 */
export async function fetchReadiness(): Promise<ReadinessResponse | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(`${API_BASE_URL}/api/v1/health/ready`, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok && res.status !== 503) {
      return null;
    }
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Register new user & auto-provision workspace
 */
export async function registerApi(
  email: string,
  password: string,
  fullName?: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, full_name: fullName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Registration failed");
  }
  return res.json();
}

/**
 * Login user & get JWT token
 */
export async function loginApi(
  email: string,
  password: string
): Promise<{ access_token: string; token_type: string }> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Login failed");
  }
  return res.json();
}

/**
 * Fetch profile and accessible workspaces
 */
export async function fetchProfileApi(
  token: string
): Promise<{ user: User; workspaces: Workspace[] }> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch profile");
  }
  return res.json();
}

/**
 * List workspace documents
 */
export async function fetchDocumentsApi(
  workspaceId: string,
  token: string
): Promise<DocumentItem[]> {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/workspaces/${workspaceId}/documents`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch documents");
  }
  return res.json();
}

/**
 * Upload document to workspace
 */
export async function uploadDocumentApi(
  workspaceId: string,
  file: File,
  token: string
): Promise<DocumentItem> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(
    `${API_BASE_URL}/api/v1/workspaces/${workspaceId}/documents/upload`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to upload document");
  }
  return res.json();
}

/**
 * Fetch document details including chunks
 */
export async function fetchDocumentDetailsApi(
  workspaceId: string,
  documentId: string,
  token: string
): Promise<DocumentItem> {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/workspaces/${workspaceId}/documents/${documentId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch document details");
  }
  return res.json();
}

/**
 * Delete document
 */
export async function deleteDocumentApi(
  workspaceId: string,
  documentId: string,
  token: string
): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/workspaces/${workspaceId}/documents/${documentId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) {
    throw new Error("Failed to delete document");
  }
}


export interface GraphNode {
  id: string;
  name: string;
  type: string;
  description: string;
  degree: number;
  color?: string;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  predicate: string;
  description: string;
  confidence: number;
  chunk_id?: string;
}

export interface GraphStats {
  total_nodes: number;
  total_edges: number;
  entity_types: Record<string, number>;
  density: number;
  connected_components: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: GraphStats;
}

export interface TraversalResult {
  found: boolean;
  path_nodes: string[];
  path_edges: Array<{ source: string; target: string; predicate: string; description: string }>;
  sub_graph: GraphData;
  reasoning: string;
  provenance_chunks: Array<{ chunk_id: string; relationship: string; evidence_snippet: string }>;
}

export interface ExtractionResult {
  extracted_nodes_count: number;
  extracted_edges_count: number;
  triples: Array<{
    id: string;
    subject: string;
    predicate: string;
    object: string;
    description: string;
    confidence: number;
    source_chunk: string;
  }>;
  graph: GraphData;
}

/**
 * Fetch full workspace knowledge graph
 */
export async function fetchKnowledgeGraphApi(
  workspaceId: string,
  token: string
): Promise<GraphData> {
  const res = await fetch(`${API_BASE_URL}/api/v1/workspaces/${workspaceId}/graph`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch knowledge graph");
  }
  return res.json();
}

/**
 * Run real entity and relation extraction on text/chunks
 */
export async function extractGraphApi(
  workspaceId: string,
  params: { documentId?: string; rawText?: string },
  token: string
): Promise<ExtractionResult> {
  const res = await fetch(`${API_BASE_URL}/api/v1/workspaces/${workspaceId}/graph/extract`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      document_id: params.documentId,
      raw_text: params.rawText,
    }),
  });
  if (!res.ok) {
    throw new Error("Failed to extract knowledge graph");
  }
  return res.json();
}

/**
 * Execute real multi-hop pathfinding traversal
 */
export async function traverseGraphApi(
  workspaceId: string,
  params: { sourceEntity?: string; targetEntity?: string; query?: string; maxDepth?: number },
  token: string
): Promise<TraversalResult> {
  const res = await fetch(`${API_BASE_URL}/api/v1/workspaces/${workspaceId}/graph/traverse`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      source_entity: params.sourceEntity,
      target_entity: params.targetEntity,
      query: params.query,
      max_depth: params.maxDepth || 2,
    }),
  });
  if (!res.ok) {
    throw new Error("Failed to traverse knowledge graph");
  }
  return res.json();
}
