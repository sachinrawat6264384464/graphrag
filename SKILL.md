# NEXUSAI — AI CODING AGENT SKILL

This skill defines the operating procedure for AI coding agents. It complements `MASTER_PROMPT.md`.

## 1. Before changes
1. Inspect repository tree and current branch.
2. Read MASTER_PROMPT.md, DESIGN.md, and AGENT_HANDOVER.md.
3. Inspect manifests, dependencies, environment templates, migrations, tests, and conventions.
4. Classify task: frontend, backend, retrieval, graph, orchestration, infra, or cross-cutting.
5. Verify dependency compatibility from repository metadata; do not blindly upgrade.
6. Identify affected contracts/files.
7. State plan before editing.
Never assume files exist or overwrite user work.

## 2. Teaching protocol
Use clear Hinglish with English technical vocabulary. Explain what/why/how and data flow, give one NexusAI example, discuss trade-offs and common mistakes, include commands and expected output. Distinguish learning implementation from production implementation.

## 3. Implementation protocol
For each task: restate goal and acceptance criteria; inspect files; propose smallest safe change; update types/schemas first when contracts change; implement one vertical slice; add tests; run formatting/lint/type checks/tests when available; report actual results; update docs and handover; list risks and next task.

## 4. RAG rules
### Ingestion
Preserve document/version/page/chunk/tenant metadata. Use deterministic IDs where possible. Re-index idempotently. Propagate deletion to vectors, graph, cache, and storage according to policy. Validate parser output.

### Dense
Record embedding model/version/dimension. Do not mix incompatible embedding spaces without migration. HNSW is an approximate vector index, not a knowledge graph. Tune using evaluation. Apply tenant/ACL filters.

### Sparse
Start with PostgreSQL FTS where suitable. Clearly state it is not identical to BM25. Preserve exact IDs/error codes/technical terms. Consider OpenSearch/Elasticsearch or dedicated BM25 if needed.

### Hybrid
Use RRF baseline; deduplicate by stable chunk identity. Log ranks and contributions. Weighted fusion requires score calibration/normalization. Do not compare raw scores from different systems blindly.

### Reranking
Rerank bounded candidates only. Record model/version. Distinguish reranker scores from retrieval scores. Evaluate quality/latency against baseline.

## 5. Graph rules
Use explicit entity/relationship schemas. Validate extraction before writes. Canonicalize aliases/duplicates. Preserve provenance. Enforce tenant scope. Bound depth, nodes, and runtime. Use parameterized Cypher. Never execute arbitrary model-generated Cypher. Extraction confidence is not truth. Track temporal validity/source version.

## 6. GraphRAG rules
Local retrieval explores relevant entities/neighbors and source chunks. Global retrieval uses community summaries for broad questions. Version community detection and summaries. Link summaries to members and evidence. Global summaries are lossy; verify detailed claims with local evidence. Add DRIFT-like behavior only after baseline evaluation. Do not claim exact Microsoft GraphRAG parity without proof.

## 7. Orchestration and agents
Prefer deterministic pipelines. Use LangGraph when state, branching, retries, checkpoints, or human approval justify it. Define typed state and explicit node contracts. Add timeouts/retry limits. Use tool allowlists and validate arguments. Agents must never bypass ACL. No arbitrary shell, SQL, Cypher, or filesystem execution. Human approval for destructive/external side effects.

## 8. Security
Every endpoint authenticates and authorizes. Every query tenant-scoped. ACL enforced before retrieval/traversal. Parameterized SQL/Cypher. Do not log secrets or unnecessary sensitive text. Validate files. Treat documents as untrusted prompt data. Test cross-tenant isolation and unauthorized graph paths.

## 9. Testing
Unit: chunking, fusion, schemas, canonicalization, filters.
Integration: PostgreSQL, pgvector, Neo4j, Redis.
Retrieval: labelled query/chunk pairs.
Graph: entities, edges, paths, provenance.
Security: tenant isolation, roles, injection.
API: validation, pagination, errors.
E2E: upload -> index -> query -> cited answer.
Performance: ingestion throughput, retrieval latency, bounded traversal.
Do not rely only on LLM-as-judge; include deterministic labelled tests.

## 10. Definition of done
Correct module, typed validation, tests added/run, errors handled, security boundaries preserved, docs updated, handover records changed files/commands/results/next task.

## 11. Required completion report
### What changed
### How it works
### Files changed
### How to run
### Validation (only commands actually run)
### Risks / limitations
### Next step
