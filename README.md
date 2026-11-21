# NexusAI — Enterprise Hybrid RAG + GraphRAG Intelligence Platform

NexusAI is a production-grade enterprise knowledge intelligence platform combining:
1. **Dense Semantic Retrieval** (PostgreSQL + pgvector with HNSW index)
2. **Sparse Keyword Retrieval** (PostgreSQL Full-Text Search / BM25)
3. **Knowledge Graph Traversal & Extraction** (Neo4j Property Graph + Cypher)
4. **Hybrid Rank Fusion** (Reciprocal Rank Fusion - RRF)
5. **Cross-Encoder Reranking**
6. **Multi-Tenant Isolation & Evidence-Grounded Citations**

---

## Repository Structure

```
.
├── docker-compose.yml       # Docker Compose for PostgreSQL + pgvector, Neo4j, Redis
├── .env.example             # Comprehensive configuration template with placeholders
├── README.md                # Main platform documentation and setup guide
├── backend/                 # FastAPI Asynchronous Backend
│   ├── app/
│   │   ├── main.py          # FastAPI application entrypoint & lifespan
│   │   ├── core/            # Config (Pydantic Settings) & structured logging
│   │   ├── api/             # API routes (/api/v1) & router
│   │   │   └── v1/endpoints/health.py  # Liveness & Readiness endpoints
│   │   ├── schemas/         # Pydantic v2 schemas
│   │   └── db/              # Async PostgreSQL, Neo4j, and Redis clients
│   ├── tests/               # Pytest async test suite (health, config)
│   ├── requirements.txt     # Backend runtime dependencies
│   ├── requirements-dev.txt # Test & lint dependencies
│   └── pyproject.toml       # Ruff & pytest configuration
└── frontend/                # Next.js App Router Web UI
    ├── src/
    │   ├── app/             # Layout, globals.css, and dashboard home page
    │   └── lib/             # Typed API client and utilities
    ├── package.json         # Node dependencies
    └── tailwind.config.ts   # Design tokens & color system
```

---

## Prerequisites & Hardware Guidelines

- **OS**: Windows 10/11, Linux, or macOS.
- **Python**: Recommended **Python 3.12** (`C:\Program Files\Python312\python.exe` on Windows).
- **Node.js**: Node 20+ or 24 LTS, npm 10+.
- **Hardware RAM Consideration**:
  - The development host has ~8GB total RAM.
  - To prevent out-of-memory crashes, `docker-compose.yml` has tuned memory limits:
    - PostgreSQL: 1GB limit (`shared_buffers=256MB`)
    - Neo4j: 2GB limit (Heap 1024MB, Pagecache 512MB)
    - Redis: 384MB limit (Maxmemory 256MB)
    - LLM / Embeddings: Recommend lightweight models (`BAAI/bge-small-en-v1.5` and `llama3.2:3b` via Ollama).

---

## Quickstart Setup Guide

### 1. Environment Setup

Copy `.env.example` to `.env`:
```powershell
# Windows PowerShell
Copy-Item .env.example .env

# Bash / Linux / macOS
cp .env.example .env
```

### 2. Infrastructure (Docker Compose)

Start PostgreSQL + pgvector, Neo4j, and Redis:
```bash
docker compose up -d
```
Check container health:
```bash
docker compose ps
```

*Note: If Docker is not installed on your machine, you can run standalone local instances or free cloud instances (e.g. Neon PostgreSQL for pgvector, Neo4j Aura Free, local Redis).*

### 3. Backend Setup & Run

Create and activate a Python 3.12 virtual environment:
```powershell
# Windows PowerShell
& "C:\Program Files\Python312\python.exe" -m venv backend\.venv
.\backend\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r backend\requirements.txt -r backend\requirements-dev.txt

# Run backend development server
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

The interactive OpenAPI documentation will be available at:
- Swagger UI: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
- Health Liveness: [http://localhost:8000/api/v1/health/live](http://localhost:8000/api/v1/health/live)
- Health Readiness: [http://localhost:8000/api/v1/health/ready](http://localhost:8000/api/v1/health/ready)

### 4. Running Backend Tests

With the virtual environment activated:
```bash
pytest backend/tests -v
```

### 5. Frontend Setup & Run

```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Phase Status

Currently at **Phase 0 (Completed)**.
Before moving to **Phase 1 (Auth, Multi-Tenancy & Relational Schema)**, review `AGENT_HANDOVER.md`.

