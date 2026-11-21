"use client";

import { useState } from "react";
import {
  Layers,
  Search,
  Cpu,
  Share2,
  FileCheck,
  Zap,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface PipelineStage {
  step: number;
  name: string;
  category: "Preprocessing" | "Retrieval" | "Fusion" | "Graph" | "Re-ranking" | "Generation";
  latencyEstimate: string;
  status: "active" | "planned" | "ready";
  description: string;
  technicalDetails: string;
}

export function InspectorView() {
  const [activeStep, setActiveStep] = useState<number>(4);

  const stages: PipelineStage[] = [
    {
      step: 1,
      name: "Query Preprocessing & Intent Rewriter",
      category: "Preprocessing",
      latencyEstimate: "~15ms",
      status: "ready",
      description: "Decomposes complex multi-faceted questions into dense search queries and keyword terms.",
      technicalDetails: "Performs stop-word removal, synonym expansion, and entity tagging.",
    },
    {
      step: 2,
      name: "Dense Semantic Vector Retrieval",
      category: "Retrieval",
      latencyEstimate: "~45ms",
      status: "ready",
      description: "HNSW approximate nearest neighbor cosine search on 1536-dimensional embeddings in pgvector.",
      technicalDetails: "Query embedding generated via text-embedding-3-small and matched with LIMIT 50.",
    },
    {
      step: 3,
      name: "Sparse Keyword & Trigram Search",
      category: "Retrieval",
      latencyEstimate: "~25ms",
      status: "ready",
      description: "Exact terminology retrieval using PostgreSQL pg_trgm and BM25 ranking algorithms.",
      technicalDetails: "Captures specialized acronyms, part numbers, and verbatim phrases that dense embeddings miss.",
    },
    {
      step: 4,
      name: "Reciprocal Rank Fusion (RRF)",
      category: "Fusion",
      latencyEstimate: "~5ms",
      status: "ready",
      description: "Mathematical score-independent merging of dense and sparse result lists.",
      technicalDetails: "Formula: RRF(d) = Σ [ 1 / (60 + r_m(d)) ] where r_m is the rank position in retriever m.",
    },
    {
      step: 5,
      name: "Neo4j Graph Sub-Graph Expansion",
      category: "Graph",
      latencyEstimate: "~75ms",
      status: "planned",
      description: "Traverses 1-hop and 2-hop entity relationships to discover non-obvious structural context.",
      technicalDetails: "Executes parameterized Cypher queries to extract connected triples with tenant isolation.",
    },
    {
      step: 6,
      name: "Cross-Encoder Re-Ranking",
      category: "Re-ranking",
      latencyEstimate: "~60ms",
      status: "planned",
      description: "Full cross-attention re-ranking of top 20 candidate passages to eliminate hallucinations.",
      technicalDetails: "Scores query-document pairs jointly with high-precision transformer cross-encoder.",
    },
    {
      step: 7,
      name: "Evidence Synthesis & Citation Grounding",
      category: "Generation",
      latencyEstimate: "~450ms",
      status: "ready",
      description: "Generates natural language response strictly bound to verifiable cited chunk passages.",
      technicalDetails: "Injects chunk IDs and offsets so every sentence is verifiable back to original document pages.",
    },
  ];

  const currentStage = stages.find((s) => s.step === activeStep) || stages[3];

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Retrieval Pipeline Inspector</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time inspection of NexusAI's 7-stage Hybrid RAG + GraphRAG orchestration engine.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-medium">
          <Zap className="h-3.5 w-3.5 text-accent" />
          <span>Total Pipeline Latency: ~675ms</span>
        </div>
      </div>

      {/* 7-Stage Interactive Pipeline Flow */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-xs space-y-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Execution Flow (Click any stage to inspect details)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-2.5">
          {stages.map((stage) => {
            const isSelected = stage.step === activeStep;
            return (
              <div
                key={stage.step}
                onClick={() => setActiveStep(stage.step)}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all space-y-1.5 ${
                  isSelected
                    ? "border-accent bg-accent/10 shadow-xs ring-1 ring-accent"
                    : "border-border bg-surface-muted/50 hover:bg-surface-muted hover:border-accent/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isSelected ? "bg-accent text-white" : "bg-surface text-muted-foreground border border-border"
                    }`}
                  >
                    {stage.step}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {stage.latencyEstimate}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-foreground line-clamp-2 leading-tight">
                  {stage.name.split(" ")[0]} {stage.name.split(" ")[1]}
                </h4>
                <span className="text-[10px] text-accent block font-medium">
                  {stage.category}
                </span>
              </div>
            );
          })}
        </div>

        {/* Selected Stage Detail Card */}
        <div className="rounded-xl border border-border bg-surface-muted/40 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="h-7 w-7 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-xs">
                {currentStage.step}
              </span>
              <div>
                <h4 className="font-bold text-sm text-foreground">{currentStage.name}</h4>
                <span className="text-[11px] text-accent font-medium">
                  Category: {currentStage.category} • Target Budget: {currentStage.latencyEstimate}
                </span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 self-start sm:self-auto">
              <CheckCircle2 className="h-3 w-3" /> Architecture Verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <span className="font-semibold text-foreground block">Functional Objective</span>
              <p className="text-muted-foreground leading-relaxed">
                {currentStage.description}
              </p>
            </div>
            <div className="space-y-1.5">
              <span className="font-semibold text-foreground block">Implementation Details</span>
              <p className="font-mono text-muted-foreground text-[11px] leading-relaxed bg-surface p-3 rounded-lg border border-border">
                {currentStage.technicalDetails}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
