# NEXUSAI — AGENT HANDOVER & CONTINUITY

Update this file after every meaningful implementation task. It is the continuity record between agents/sessions.

## 1. Project identity
- Name: NexusAI
- Category: Enterprise Hybrid RAG + GraphRAG knowledge intelligence
- Goal: Evidence-grounded answers across semantic, keyword, and graph retrieval
- Method: Learning-first vertical slices, then production hardening
- Owner explanations: Hinglish
- Architecture: MASTER_PROMPT.md
- UX: DESIGN.md
- Agent procedure: SKILL.md

## 2. Baseline decisions
| Area | Decision |
|---|---|
| Frontend | Next.js App Router, React, TypeScript |
| UI | Tailwind, shadcn/ui, Framer Motion |
| Backend | Python 3.11+, FastAPI, Pydantic v2 |
| ORM/migrations | SQLAlchemy 2.x async, Alembic |
| Relational DB | PostgreSQL |
| Vector | pgvector + HNSW |
| Initial sparse | PostgreSQL Full Text Search |
| Graph | Neo4j |
| Cache/jobs | Redis + Celery |
| Embeddings | Local BGE/E5 adapter |
| Reranker | Cross-Encoder/BGE adapter |
| LLM | Ollama/local first; hosted optional |
| Orchestration | LangGraph when justified |
| Evaluation | RAGAS + deterministic tests |
| Observability | OpenTelemetry + optional Langfuse |
| Local infra | Docker Compose |
| Storage | Local adapter first; S3-compatible later |

These are defaults, not permission to upgrade dependencies or create paid resources. Check repository compatibility first.

## 3. Product scope
### MVP
- Auth/workspaces baseline
- Document upload/status
- Parsing/chunking
- Embeddings/pgvector
- Dense retrieval
- Sparse retrieval
- RRF hybrid retrieval
- Reranking
- Chat citations
- Neo4j entities/relationships
- Bounded graph retrieval
- Combined retrieval
- Retrieval inspector

### Advanced
- Entity resolution
- Community detection/summaries
- Global GraphRAG
- Query router/LangGraph
- Multi-tenant RBAC/audit
- Evaluation dashboard
- Observability/performance
- Deployment/operations docs

## 4. Phase tracker
| Phase | Scope | Status | Notes |
|---|---|---|---|
| 0 | Repo inspection, architecture, skeleton, Docker | DONE | Skeletons created, 7/7 tests passed |
| 1 | Auth/workspaces/PostgreSQL | NOT STARTED | Next immediate phase |
| 2 | Upload/storage/jobs/parsing/chunking | NOT STARTED | |
| 3 | Embeddings/pgvector/HNSW/dense | NOT STARTED | |
| 4 | Sparse/hybrid/RRF/inspector | NOT STARTED | |
| 5 | Reranking/context builder | NOT STARTED | |
| 6 | Neo4j/extraction/resolution/provenance | NOT STARTED | |
| 7 | Graph traversal/local GraphRAG | NOT STARTED | |
| 8 | Communities/global retrieval | NOT STARTED | |
| 9 | Hybrid + graph routing/fusion | NOT STARTED | |
| 10 | LangGraph orchestration | NOT STARTED | |
| 11 | Evaluation/security/observability/load | NOT STARTED | |
| 12 | Deployment/readiness | NOT STARTED | |

Use only: NOT STARTED, IN PROGRESS, BLOCKED, DONE.

## 5. Actual repository state
Fill only after inspecting repository:
- Repository path: `D:\Graph Rag`
- Branch/commit: Initialized Git repository, main branch
- Frontend status: Next.js 15 App Router skeleton (`frontend/`), TypeScript strict, Tailwind CSS with `DESIGN.md` tokens, typed API client (`api.ts`), and system readiness dashboard (`src/app/page.tsx`).
- Backend status: FastAPI app in `backend/app` with `/` index, `/api/v1/health/live`, `/api/v1/health/ready` (checking PostgreSQL, Neo4j, Redis concurrently). Lifespan manages connection pools.
- DB/migrations: Docker Compose (`docker-compose.yml`) defines PostgreSQL 16 with pgvector, Neo4j 5.26 Community with APOC, and Redis 7 Alpine.
- Docker: Configured in `docker-compose.yml` with memory limits tuned for 8GB RAM host. Note: Docker CLI is currently not found in PATH on the host. Standalone or cloud instance support documented.
- Tests: Pytest test suite in `backend/tests/` (7 tests, all passing: root, liveness, offline readiness, healthy mock readiness, strict 503 readiness, config validation).
- Existing conventions: Async SQLAlchemy 2.0 (`asyncpg`), Pydantic v2 with Settings, Ruff formatting/linting configured.
- Constraints: Host RAM 8GB (~744MB free during inspection), C: drive ~3.9GB free, D: drive ~58GB free. Virtual environment created on D: drive (`backend/.venv`) using Python 3.12.6.

Do not invent paths or claim implementation exists without checking.

## 6. Environment and secrets
Keep secrets only in local `.env` or secret manager. Commit placeholders in `.env.example`, never real credentials. Do not put secrets in this file.

Suggested variable names:
`DATABASE_URL`, `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`, `REDIS_URL`, `JWT_SECRET_KEY`, `LLM_PROVIDER`, `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, `EMBEDDING_MODEL`, `RERANKER_MODEL`, `OBJECT_STORAGE_BACKEND`.

Record whether Ollama is installed and model configured, not credentials.

## 7. Data/API invariants
Record schema changes, migration IDs, endpoint contracts, sample requests/responses, and compatibility notes.
- Every tenant-owned record is tenant/workspace scoped.
- Every chunk links to source document and version.
- Every graph fact links to supporting source evidence.
- Every retrieval result has stable source identifiers.
- Every citation resolves to an authorized source.
- Scores from different retrieval stages are not assumed comparable.

## 8. Decision log
For each new decision record date, decision, alternatives, reason, consequences.
Initial decisions:
1. pgvector for manageable first dense retrieval stack.
2. PostgreSQL FTS initially; evaluate dedicated BM25 later.
3. Neo4j for graph modelling/Cypher learning.
4. RRF baseline because raw retrieval scores may not share a scale.
5. Local model first with provider interfaces; no mandatory paid API.
6. Deterministic retrieval first; LangGraph when branching/state adds value.

## 9. Risks
- Local hardware memory; use small models and batches.
- PostgreSQL FTS is not identical to BM25.
- Extraction may produce false/duplicate relationships.
- Community summaries may omit details; verify with source evidence.
- PostgreSQL/Neo4j consistency needs idempotency and reconciliation.
- Updates/deletions must invalidate graph, vectors, and caches.
- ACL must be enforced during graph traversal.
- LLM answers can hallucinate; enforce citations and abstention.
- Measure provider latency/cost and local resource use.

## 10. Last completed task
- Date: 2026-11-21
- Summary: Phase 0 Completed: Inspected repository and host environment, designed compatible architecture, created backend skeleton (FastAPI + Pydantic v2 + SQLAlchemy asyncpg + Neo4j driver + Redis client), created frontend skeleton (Next.js 15 App Router + Tailwind + TypeScript), configured docker-compose.yml with 8GB RAM host memory limits, configured .env.example, added setup documentation (README.md), and created 7 unit tests covering health probes and settings.
- Files changed: `.gitignore`, `.env.example`, `docker-compose.yml`, `README.md`, `backend/app/*`, `backend/tests/*`, `backend/requirements.txt`, `backend/requirements-dev.txt`, `backend/pyproject.toml`, `frontend/*`, `AGENT_HANDOVER.md`.
- Migrations: None (Phase 0).
- Commands run:
  - `& "C:\Program Files\Python312\python.exe" -m venv "D:\Graph Rag\backend\.venv"`
  - `& "D:\Graph Rag\backend\.venv\Scripts\pip.exe" install --no-cache-dir -r backend/requirements.txt -r backend/requirements-dev.txt`
  - `pytest backend/tests -v`
- Test results: 7 passed in 6.54s (100% pass).
- Manual verification: Verified ASGI responses for `/`, `/api/v1/health/live`, `/api/v1/health/ready`.
- Remaining issues: Docker CLI not found in Windows PATH (standalone and cloud services supported via config).

## 11. Next exact task
Implement Phase 1: Authentication, Workspaces, Multi-Tenant Isolation, and PostgreSQL schema with SQLAlchemy 2.x async models and Alembic migrations.

## 12. Next-agent instructions
1. Read all four project reference files.
2. Inspect repository; verify status rather than trusting stale notes.
3. Verify last task and test results.
4. Continue only the next exact task.
5. Do not redo completed work unless inspection/tests show a defect.
6. Document architecture changes and reasons.
7. No destructive migrations, user-data deletion, paid resources, or deployment without approval.
8. Update this file before handoff.
