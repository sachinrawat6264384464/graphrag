"use client";

import { useState } from "react";
import {
  Sparkles,
  Play,
  RotateCcw,
  Database,
  Share2,
  Layers,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Code2,
  FileText,
  Search,
  Cpu,
  Zap,
  Info,
  ChevronRight,
  Sliders,
} from "lucide-react";

export function ArchitectureLabView() {
  const [activeSubTab, setActiveSubTab] = useState<"query" | "ingestion">("query");

  // Query Simulation State
  const [selectedQuery, setSelectedQuery] = useState(
    "How does NexusAI combine dense pgvector embeddings with Neo4j graph traversal?"
  );
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Ingestion Stage State
  const [selectedStorageStage, setSelectedStorageStage] = useState<number>(1);

  const queryPresets = [
    "How does NexusAI combine dense pgvector embeddings with Neo4j graph traversal?",
    "What are the security boundaries in multi-tenant workspaces?",
    "Explain how Reciprocal Rank Fusion (RRF) merges candidate lists mathematically.",
  ];

  const runSimulation = () => {
    setSimulationRunning(true);
    setCurrentStep(1);

    const stepIntervals = [
      setTimeout(() => setCurrentStep(2), 700),  // Dense & Sparse search
      setTimeout(() => setCurrentStep(3), 1500), // GraphRAG traversal
      setTimeout(() => setCurrentStep(4), 2300), // RRF Fusion
      setTimeout(() => setCurrentStep(5), 3100), // Re-ranking
      setTimeout(() => {
        setCurrentStep(6); // Final Synthesis
        setSimulationRunning(false);
      }, 3900),
    ];
  };

  const resetSimulation = () => {
    setCurrentStep(0);
    setSimulationRunning(false);
  };

  const storageStages = [
    {
      step: 1,
      title: "File Upload & SHA-256 Hashing",
      destination: "Disk & Memory",
      badge: "Idempotency",
      description: "Document file bytes are read and SHA-256 hash is computed. If identical content was already uploaded to this workspace, duplicates are prevented.",
      recordSample: {
        filename: "nexus_architecture.pdf",
        file_size_bytes: 418290,
        sha256_hash: "a4f8e912b7c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0",
        deduplication_status: "PASSED_UNIQUE",
      },
    },
    {
      step: 2,
      title: "Tenant-Isolated Disk Storage",
      destination: "Local / S3 Storage",
      badge: "Security",
      description: "File is saved inside a dedicated tenant directory: `storage/uploads/{workspace_id}/{hash}.pdf`. No other tenant can access this physical file.",
      recordSample: {
        storage_path: "storage/uploads/c7b1a2d3-4e5f-6a7b-8c9d-0e1f2a3b4c5d/a4f8e912b7c4d5e6.pdf",
        workspace_id: "c7b1a2d3-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
        permissions: "chmod 0600 (owner only)",
      },
    },
    {
      step: 3,
      title: "Text Parsing & Page Extraction",
      destination: "Parser Engine (pypdf / markdown)",
      badge: "Normalization",
      description: "Extracts raw text, strips invalid control characters, detects headings, and preserves page boundaries for accurate citation tracking.",
      recordSample: {
        total_pages: 12,
        extracted_characters: 48920,
        metadata: { author: "NexusAI Architecture Team", format: "PDF-1.7" },
      },
    },
    {
      step: 4,
      title: "Recursive Token-Bounded Chunking",
      destination: "Chunking Buffer",
      badge: "Chunking",
      description: "Text is broken into 1,000 token passages with 150 token sliding overlap. Headings and paragraphs are preserved across chunk boundaries.",
      recordSample: {
        chunk_size: 1000,
        chunk_overlap: 150,
        total_chunks_created: 14,
        sample_chunk: {
          chunk_index: 0,
          token_count: 894,
          page_number: 1,
          preview: "NexusAI unifies dense semantic search, exact keyword matching, and property graph traversal...",
        },
      },
    },
    {
      step: 5,
      title: "Relational ACID Persistence",
      destination: "PostgreSQL (document_chunks table)",
      badge: "PostgreSQL",
      description: "Metadata and chunks are committed to PostgreSQL tables `documents` and `document_chunks` with foreign key cascade and workspace tenant isolation.",
      recordSample: {
        table: "document_chunks",
        sql: "INSERT INTO document_chunks (id, workspace_id, document_id, chunk_index, content, token_count) VALUES ($1, $2, $3, $4, $5, $6);",
        isolation: "Enforced via workspace_id WHERE clauses",
      },
    },
    {
      step: 6,
      title: "Dense Vector Embedding & HNSW Indexing",
      destination: "PostgreSQL pgvector (embedding column)",
      badge: "pgvector HNSW",
      description: "Each text chunk is passed through embedding model (1536 dimensions) and stored in `embedding vector(1536)`. Indexed via HNSW for sub-50ms cosine search.",
      recordSample: {
        embedding_dimension: 1536,
        vector_sample: "[0.0142, -0.0891, 0.2310, 0.0451, ..., -0.0129]",
        index_type: "HNSW (m=16, ef_construction=64, metric=cosine)",
      },
    },
    {
      step: 7,
      title: "Entity & Relationship Graph Extraction",
      destination: "Neo4j Property Graph",
      badge: "Neo4j GraphRAG",
      description: "Named entities (Concepts, Tools, Entities) and relationships (USES, EXTENDS, INDEXES) are extracted from chunks and committed into Neo4j nodes & edges.",
      recordSample: {
        cypher: "MERGE (s:Entity {name: 'NexusAI', workspace_id: $ws_id}) MERGE (o:Entity {name: 'PostgreSQL'}) MERGE (s)-[:USES {chunk_id: $chunk_id}]->(o);",
        created_nodes: ["NexusAI", "PostgreSQL", "Neo4j", "pgvector"],
        created_edges: ["USES", "INTEGRATES", "POWERS"],
      },
    },
  ];

  const activeStageData = storageStages.find((s) => s.step === selectedStorageStage) || storageStages[0];

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20 mb-1.5">
            <Zap className="h-3.5 w-3.5" />
            <span>Interactive Visual Architecture Lab</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">How Hybrid RAG & GraphRAG Work</h2>
          <p className="text-xs text-muted-foreground">
            Explore live data flow, vector embeddings, graph traversal, and how documents are stored into PostgreSQL and Neo4j.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="inline-flex items-center p-1 rounded-lg border border-border bg-surface text-xs font-medium">
          <button
            onClick={() => setActiveSubTab("query")}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "query"
                ? "bg-accent text-white shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Play className="h-3.5 w-3.5" />
            <span>Query Lifecycle (Live Simulation)</span>
          </button>
          <button
            onClick={() => setActiveSubTab("ingestion")}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "ingestion"
                ? "bg-accent text-white shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>Data Ingestion & Storage Journey</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: QUERY LIFECYCLE SIMULATION */}
      {activeSubTab === "query" && (
        <div className="space-y-6">
          {/* Query Controller Box */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">Interactive Query Execution Flow</h3>
                <p className="text-xs text-muted-foreground">
                  Run a query and watch it branch into Dense (pgvector), Sparse (BM25), and Graph (Neo4j) paths simultaneously!
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={resetSimulation}
                  disabled={simulationRunning || currentStep === 0}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-surface hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={runSimulation}
                  disabled={simulationRunning}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-accent text-white hover:bg-accent/90 transition-all cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Play className={`h-3.5 w-3.5 ${simulationRunning ? "animate-spin" : ""}`} />
                  <span>{simulationRunning ? "Executing Flow..." : "▶ Run Live Simulation"}</span>
                </button>
              </div>
            </div>

            {/* Query Input & Presets */}
            <div className="space-y-2">
              <input
                type="text"
                value={selectedQuery}
                onChange={(e) => setSelectedQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-muted px-4 py-2 text-xs font-medium focus:border-accent focus:outline-none"
              />
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pt-1">
                <span className="text-muted-foreground font-semibold shrink-0">Sample Queries:</span>
                {queryPresets.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedQuery(q);
                      resetSimulation();
                    }}
                    className="px-2.5 py-0.5 rounded-full border border-border bg-surface hover:bg-surface-muted text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                  >
                    Preset {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Flow Pipeline Multi-Column Visualizer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Dense Semantic Vector Path */}
            <div
              className={`rounded-xl border p-4 space-y-3 transition-all ${
                currentStep >= 2
                  ? "border-green-500/60 bg-green-500/5 shadow-sm"
                  : "border-border bg-surface opacity-70"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-green-500/10 text-green-500">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">Branch 1: Dense Semantic</h4>
                    <span className="text-[10px] text-muted-foreground">PostgreSQL + pgvector</span>
                  </div>
                </div>
                {currentStep >= 2 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-600 dark:text-green-400">
                    42ms
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded bg-surface border border-border font-mono text-[10px] text-muted-foreground">
                  <span className="text-foreground font-semibold block">1. Embedding Generation:</span>
                  1536-dim vector: [0.0381, -0.1042, 0.4419, ...]
                </div>

                <div className="p-2.5 rounded bg-surface border border-border font-mono text-[10px] text-muted-foreground">
                  <span className="text-foreground font-semibold block">2. HNSW Cosine Index Match:</span>
                  ORDER BY embedding &lt;=&gt; query_vector LIMIT 50
                </div>

                {currentStep >= 2 && (
                  <div className="p-2 rounded bg-green-500/10 border border-green-500/20 text-[11px] text-green-700 dark:text-green-300 space-y-1">
                    <span className="font-bold block">Top Matches:</span>
                    <div>• Chunk #1 (score: 0.94)</div>
                    <div>• Chunk #4 (score: 0.88)</div>
                    <div>• Chunk #7 (score: 0.81)</div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Sparse Lexical BM25 Path */}
            <div
              className={`rounded-xl border p-4 space-y-3 transition-all ${
                currentStep >= 2
                  ? "border-blue-500/60 bg-blue-500/5 shadow-sm"
                  : "border-border bg-surface opacity-70"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
                    <Search className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">Branch 2: Sparse Lexical</h4>
                    <span className="text-[10px] text-muted-foreground">PostgreSQL Trigram / BM25</span>
                  </div>
                </div>
                {currentStep >= 2 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-600 dark:text-blue-400">
                    18ms
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded bg-surface border border-border font-mono text-[10px] text-muted-foreground">
                  <span className="text-foreground font-semibold block">1. Term Tokenization:</span>
                  terms: ["nexusai", "pgvector", "neo4j", "hybrid"]
                </div>

                <div className="p-2.5 rounded bg-surface border border-border font-mono text-[10px] text-muted-foreground">
                  <span className="text-foreground font-semibold block">2. Inverted Index Lookup:</span>
                  ts_rank_cd(to_tsvector(content), query)
                </div>

                {currentStep >= 2 && (
                  <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-700 dark:text-blue-300 space-y-1">
                    <span className="font-bold block">Exact Keyword Matches:</span>
                    <div>• Chunk #1 (rank: 12.8)</div>
                    <div>• Chunk #3 (rank: 9.4)</div>
                    <div>• Chunk #2 (rank: 7.2)</div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. GraphRAG Knowledge Graph Path */}
            <div
              className={`rounded-xl border p-4 space-y-3 transition-all ${
                currentStep >= 3
                  ? "border-purple-500/60 bg-purple-500/5 shadow-sm"
                  : "border-border bg-surface opacity-70"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500">
                    <Share2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">Branch 3: GraphRAG Traversal</h4>
                    <span className="text-[10px] text-muted-foreground">Neo4j APOC Sub-Graph</span>
                  </div>
                </div>
                {currentStep >= 3 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-600 dark:text-purple-400">
                    68ms
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded bg-surface border border-border font-mono text-[10px] text-muted-foreground">
                  <span className="text-foreground font-semibold block">1. Query Entity Extraction:</span>
                  entities: ["NexusAI", "pgvector", "Neo4j"]
                </div>

                <div className="p-2.5 rounded bg-surface border border-border font-mono text-[10px] text-muted-foreground">
                  <span className="text-foreground font-semibold block">2. Multi-Hop Cypher:</span>
                  {"MATCH (e1)-[r:USES|INDEXES]->(e2)"} RETURN e1, r, e2
                </div>

                {currentStep >= 3 && (
                  <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-700 dark:text-purple-300 space-y-1">
                    <span className="font-bold block">Discovered Graph Triples:</span>
                    <div>• (NexusAI) {"-[:USES]->"} (PostgreSQL)</div>
                    <div>• (PostgreSQL) {"-[:INDEXES]->"} (pgvector)</div>
                    <div>• (NexusAI) {"-[:INTEGRATES]->"} (Neo4j)</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fusion & Re-Ranking Result Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step 4: Reciprocal Rank Fusion */}
            <div
              className={`rounded-xl border p-5 space-y-3 transition-all ${
                currentStep >= 4
                  ? "border-accent bg-accent/5 shadow-xs"
                  : "border-border bg-surface opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <h4 className="font-bold text-xs text-foreground">Step 4: Reciprocal Rank Fusion (RRF)</h4>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">k = 60 constant</span>
              </div>

              <div className="p-3 rounded-lg bg-surface border border-border font-mono text-[11px] text-accent">
                Formula: RRF(d) = Σ [ 1 / (60 + r_m(d)) ]
              </div>

              {currentStep >= 4 ? (
                <div className="space-y-1.5 text-xs">
                  <div className="p-2 rounded bg-surface border border-border flex items-center justify-between">
                    <span className="font-semibold text-foreground">Chunk #1 (Architecture Overview)</span>
                    <span className="font-bold text-accent">RRF: 0.0482 (#1 Ranked)</span>
                  </div>
                  <div className="p-2 rounded bg-surface border border-border flex items-center justify-between">
                    <span className="font-semibold text-foreground">Chunk #4 (pgvector HNSW Index)</span>
                    <span className="font-bold text-accent">RRF: 0.0315 (#2 Ranked)</span>
                  </div>
                  <div className="p-2 rounded bg-surface border border-border flex items-center justify-between">
                    <span className="font-semibold text-foreground">Chunk #3 (Neo4j Property Triples)</span>
                    <span className="font-bold text-accent">RRF: 0.0298 (#3 Ranked)</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Waiting for dense, sparse, and graph branches to complete...</p>
              )}
            </div>

            {/* Step 5 & 6: Grounded Evidence Generation */}
            <div
              className={`rounded-xl border p-5 space-y-3 transition-all ${
                currentStep >= 6
                  ? "border-green-500/60 bg-green-500/5 shadow-xs"
                  : "border-border bg-surface opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <h4 className="font-bold text-xs text-foreground">Step 6: Grounded Answer Synthesis</h4>
                </div>
                <span className="text-[10px] text-green-600 font-bold">100% Grounded</span>
              </div>

              {currentStep >= 6 ? (
                <div className="space-y-2 text-xs">
                  <p className="p-3 rounded-lg bg-surface border border-border text-foreground leading-relaxed">
                    NexusAI implements hybrid retrieval by executing dense HNSW vector search in PostgreSQL pgvector alongside sparse BM25 lexical search. Reciprocal Rank Fusion (RRF) mathematically combines their ranks, while Neo4j graph traversal bridges multi-hop relational dependencies between concepts.
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground">Verified Citations:</span>
                    <span className="px-2 py-0.5 rounded bg-surface border border-border text-accent font-medium">
                      [1] Chunk #1 (p. 1)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-surface border border-border text-accent font-medium">
                      [2] Neo4j Triple: {"(NexusAI) -[:USES]-> (PostgreSQL)"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-muted-foreground space-y-1">
                  <Clock className="h-5 w-5 mx-auto opacity-50" />
                  <p>Cross-encoder re-ranking and evidence grounding will appear once simulation runs.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DATA INGESTION & STORAGE JOURNEY */}
      {activeSubTab === "ingestion" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4 shadow-xs">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">
                Document Ingestion & Multi-Database Storage Journey
              </h3>
              <p className="text-xs text-muted-foreground">
                Click on any stage below to inspect exactly what data is created and where it is physically saved in PostgreSQL, pgvector, disk storage, and Neo4j!
              </p>
            </div>

            {/* Stepper Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-2">
              {storageStages.map((st) => {
                const isSelected = st.step === selectedStorageStage;
                return (
                  <button
                    key={st.step}
                    onClick={() => setSelectedStorageStage(st.step)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer space-y-1 ${
                      isSelected
                        ? "border-accent bg-accent/15 ring-1 ring-accent shadow-xs"
                        : "border-border bg-surface-muted/50 hover:bg-surface-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isSelected ? "bg-accent text-white" : "bg-surface text-muted-foreground border border-border"
                        }`}
                      >
                        {st.step}
                      </span>
                      <span className="text-[9px] font-semibold text-accent uppercase">
                        {st.badge}
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-foreground line-clamp-1 leading-tight">
                      {st.title.split(" ")[0]} {st.title.split(" ")[1]}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Storage Stage Inspector */}
          <div className="rounded-xl border border-border bg-surface p-6 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-xl bg-accent text-white flex items-center justify-center font-bold text-sm">
                  {activeStageData.step}
                </span>
                <div>
                  <h4 className="font-bold text-base text-foreground">{activeStageData.title}</h4>
                  <span className="text-xs text-accent font-medium">
                    Physical Target: {activeStageData.destination}
                  </span>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 self-start sm:self-auto">
                <CheckCircle2 className="h-3.5 w-3.5" /> Production Pattern
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-muted-foreground">
                    What happens in this stage?
                  </span>
                  <p className="text-muted-foreground leading-relaxed text-xs">
                    {activeStageData.description}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-surface-muted/40 space-y-2">
                  <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-accent" />
                    Multi-Tenant Isolation Rule
                  </span>
                  <p className="text-muted-foreground text-[11px] leading-normal">
                    Every file, chunk, vector embedding, and graph triple contains the parent <code>workspace_id</code>. Cross-tenant access is rejected at database and API layers with <code>403 Forbidden</code>.
                  </p>
                </div>
              </div>

              {/* Exact Data Record Saved in Database */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Code2 className="h-3.5 w-3.5 text-accent" />
                    Live Database Record Payload
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">JSON / SQL Payload</span>
                </div>

                <pre className="p-4 rounded-lg border border-border bg-surface-muted font-mono text-[11px] text-foreground overflow-x-auto max-h-64 leading-relaxed">
                  {JSON.stringify(activeStageData.recordSample, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
