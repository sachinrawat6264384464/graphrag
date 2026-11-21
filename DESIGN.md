# NEXUSAI — PRODUCT DESIGN & UX SPECIFICATION

## Design goal
Premium, calm, enterprise-grade knowledge platform communicating trust, clarity, evidence, and technical depth. This is a working product UI, not just a landing page.

## Visual direction
- Light foundation: white/near-white surfaces, charcoal text.
- Dark mode: near-black/navy surfaces, readable contrast.
- Restrained blue accent for primary actions and active states.
- Green success, amber warning, red error; never rely on color alone.
- Avoid excessive gradients, neon glow, glassmorphism, 3D decoration, and oversized cards.
- Use clear typography, consistent spacing, compact information hierarchy.
- Prefer tables, split panes, tabs, drawers, and detail panels for data-heavy work.

## Design tokens
Centralize CSS variables for page/surface/elevated backgrounds; primary/secondary/muted text; subtle/default/strong borders; accent/hover/subtle; status colors; radius; 4px-based spacing; subtle shadows. Support light and dark themes.

## Application shell
Desktop: left sidebar, top bar with breadcrumbs/global search/notifications/workspace, main content, optional right inspector.
Navigation:
1. Overview
2. Documents
3. AI Chat
4. Knowledge Graph
5. Retrieval Inspector
6. Evaluations
7. Observability
8. Team & Access
9. Settings

## Screens

### Dashboard
Real API-driven document counts, indexed documents, ingestion jobs, recent questions, latency trends, evaluation snapshot, activity, upload/chat/graph quick actions. Never invent metrics; show useful empty states.

### Documents
Drag/drop upload, accepted types/size limits, progress, filename/type/version/status/owner/date table, search/filter/sort/pagination, detail page with parsing/chunking/indexing stages, retry, re-index confirmation, delete confirmation. Statuses: uploaded, queued, parsing, chunking, embedding, graph_extraction, indexing, ready, failed, deleting, deleted.

### AI Chat
Conversation list, transcript, composer, streaming answers, citations, expandable source panel. Show source document/page/chunk excerpt. Where relevant separate documented facts, graph connections, and inferred possibilities. Feedback and inspect-retrieval actions. No fake citations.

### Retrieval Inspector — core educational feature
Timeline: query received -> normalization/classification -> dense -> sparse -> graph -> fusion/RRF -> rerank -> context -> generation.
For each stage show run/not-run and reason, duration, candidate count, IDs, ranks, score type, RRF contribution, reranker score, graph path/provenance, filters, errors/fallbacks.
Never imply dense similarity, BM25/FTS score, RRF score, and reranker score share a common scale.

### Knowledge Graph Explorer
Interactive node-edge canvas, zoom/pan/fit, entity search, type/relationship filters, bounded neighbor expansion, node/edge selection, path highlighting, community grouping when available, legend and edge direction. Show edge evidence and provenance. Do not render entire graph; use server-side subgraph expansion and limits. Provide searchable list fallback on small screens.

### Entity detail
Canonical name/type, aliases, properties, incoming/outgoing relationships, supporting documents/chunks, timestamps, extraction version and review state.

### Evaluations
Dataset/run selector; Recall@K, Precision@K, MRR, nDCG@K; answer faithfulness/relevance where measured; graph extraction precision/recall only with labelled data; compare dense, sparse, hybrid, reranked, graph, combined. Drill into individual questions/evidence. Never invent metrics.

### Observability
Request volume, latency percentiles, ingestion failures, provider errors, token usage/cost only when measured, retrieval branch latency, cache hit rate, trace details.

### Team and access
Workspace members, roles, invitations, permission scopes, audit history. Confirm role changes/removals.

## Reusable components
AppSidebar, Topbar, WorkspaceSwitcher, PageHeader, DataTable, FileUploader, StatusBadge, EmptyState, ErrorState, ConfirmDialog, ChatMessage, CitationChip, SourceDrawer, RetrievalTimeline, RetrievalResultList, GraphCanvas, EntityInspector, MetricCard, ChartPanel, FilterBar, Pagination, Toast.

## Accessibility and responsive behavior
Semantic HTML, accessible labels, keyboard controls, visible focus, screen-reader status, sufficient contrast, status not conveyed by color alone. Preserve core mobile workflows. Graph explorer can use searchable list fallback.

## Frontend engineering
TypeScript strict, typed API client, Zod validation, React Hook Form, TanStack Query where useful, server components by default where appropriate, client components for interaction, explicit loading/error/empty/success states. Separate visual components from data access. Never hardcode production metrics or retrieval results.

## Design acceptance checklist
- [ ] APIs power all required screens
- [ ] Light/dark themes
- [ ] Pagination/filtering
- [ ] Upload lifecycle
- [ ] Citations open real source evidence
- [ ] Inspector distinguishes score types
- [ ] Graph explorer bounded and interactive
- [ ] Loading/error/empty states
- [ ] Responsive layout
- [ ] Keyboard/focus usability
- [ ] No fake metrics/citations
