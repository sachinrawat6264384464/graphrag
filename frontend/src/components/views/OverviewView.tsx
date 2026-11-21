"use client";

import { ServiceComponentStatus, ReadinessResponse } from "@/lib/api";
import {
  Server,
  Database,
  Share2,
  Layers,
  ShieldCheck,
  Activity,
  RefreshCw,
  FileText,
  MessageSquare,
  Network,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

interface OverviewViewProps {
  readiness: ReadinessResponse | null;
  loading: boolean;
  lastUpdated: Date | null;
  onRefresh: () => void;
  onNavigateTab: (tab: "overview" | "documents" | "chat" | "graph" | "inspector") => void;
  documentCount: number;
  chunkCount: number;
  userEmail: string | null;
}

export function OverviewView({
  readiness,
  loading,
  lastUpdated,
  onRefresh,
  onNavigateTab,
  documentCount,
  chunkCount,
  userEmail,
}: OverviewViewProps) {
  const services = [
    {
      name: "FastAPI Backend",
      icon: Server,
      status: readiness ? "online" : loading ? "checking..." : "offline",
      latency: null,
      description: "Asynchronous REST API, Pydantic v2 schemas, and retrieval orchestration.",
      role: "Application Core",
    },
    {
      name: "PostgreSQL + pgvector",
      icon: Database,
      status: readiness?.services.postgres.status || (loading ? "checking..." : "offline"),
      latency: readiness?.services.postgres.latency_ms,
      description: "ACID metadata, multi-tenant records, and HNSW dense vector index.",
      role: "Relational & Dense Storage",
    },
    {
      name: "Neo4j Graph Database",
      icon: Share2,
      status: readiness?.services.neo4j.status || (loading ? "checking..." : "offline"),
      latency: readiness?.services.neo4j.latency_ms,
      description: "Entity-relation knowledge graph and bounded multi-hop GraphRAG traversal.",
      role: "Knowledge Graph Engine",
    },
    {
      name: "Redis Cache & Broker",
      icon: Layers,
      status: readiness?.services.redis.status || (loading ? "checking..." : "offline"),
      latency: readiness?.services.redis.latency_ms,
      description: "In-memory caching, rate limiting, and asynchronous Celery task broker.",
      role: "Queue & Fast Cache",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Card */}
      <section className="rounded-xl border border-border bg-gradient-to-br from-surface to-surface-muted p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Phase 2 Active: Document Ingestion & Chunking Live</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Enterprise Knowledge Intelligence</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              NexusAI unifies exact keyword search, dense semantic retrieval (pgvector), and property
              graph traversal (Neo4j) to deliver verifiable, evidence-grounded answers with precise citations.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={() => onNavigateTab("documents")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-accent text-white hover:bg-accent/90 shadow-sm transition-all cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              <span>Upload Documents</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onNavigateTab("chat")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold border border-border bg-surface hover:bg-surface-muted transition-all cursor-pointer"
            >
              <MessageSquare className="h-4 w-4 text-accent" />
              <span>AI Search & Chat</span>
            </button>
          </div>
        </div>

        {/* 3 Step Onboarding Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-border/60">
          <div
            onClick={() => onNavigateTab("documents")}
            className="p-3.5 rounded-lg border border-border/80 bg-surface/80 hover:border-accent/40 hover:bg-surface transition-all cursor-pointer space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[11px] font-bold">1</span>
                Upload Documents
              </span>
              <span className="text-[10px] text-accent font-medium">Ready</span>
            </div>
            <p className="text-xs text-muted-foreground leading-normal">
              Drop PDFs, TXT, or Markdown files. NexusAI automatically parses and extracts clean text chunks.
            </p>
          </div>

          <div
            onClick={() => onNavigateTab("chat")}
            className="p-3.5 rounded-lg border border-border/80 bg-surface/80 hover:border-accent/40 hover:bg-surface transition-all cursor-pointer space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[11px] font-bold">2</span>
                Ask Questions
              </span>
              <span className="text-[10px] text-accent font-medium">Interactive</span>
            </div>
            <p className="text-xs text-muted-foreground leading-normal">
              Query your knowledge base with dense semantic search and grounded citation extraction.
            </p>
          </div>

          <div
            onClick={() => onNavigateTab("graph")}
            className="p-3.5 rounded-lg border border-border/80 bg-surface/80 hover:border-accent/40 hover:bg-surface transition-all cursor-pointer space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[11px] font-bold">3</span>
                Explore Graph
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">Phase 6</span>
            </div>
            <p className="text-xs text-muted-foreground leading-normal">
              Traverse interconnected entity relationships in Neo4j to resolve complex multi-hop queries.
            </p>
          </div>
        </div>
      </section>

      {/* Live System Stats Summary */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-border bg-surface space-y-1">
          <span className="text-xs text-muted-foreground font-medium">Active Workspace</span>
          <p className="text-lg font-bold text-foreground truncate">
            {userEmail ? "Personal Tenant" : "Guest Sandbox"}
          </p>
          <span className="text-[11px] text-green-500 font-medium flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Strict RBAC Isolation
          </span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-surface space-y-1">
          <span className="text-xs text-muted-foreground font-medium">Ingested Documents</span>
          <p className="text-lg font-bold text-foreground">{documentCount}</p>
          <span className="text-[11px] text-accent font-medium">PDF, TXT, Markdown</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-surface space-y-1">
          <span className="text-xs text-muted-foreground font-medium">Extracted Chunks</span>
          <p className="text-lg font-bold text-foreground">{chunkCount}</p>
          <span className="text-[11px] text-accent font-medium">Recursive token bounded</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-surface space-y-1">
          <span className="text-xs text-muted-foreground font-medium">Vector Index</span>
          <p className="text-lg font-bold text-foreground">HNSW 1536-dim</p>
          <span className="text-[11px] text-muted-foreground font-medium">pgvector integrated</span>
        </div>
      </section>

      {/* Core Infrastructure Components */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Core Infrastructure Health
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-surface-muted text-muted-foreground border border-border">
              <Activity className="h-3 w-3 text-accent" />
              {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "Inspecting..."}
            </span>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh System Health"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border border-border bg-surface-muted hover:bg-surface transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin text-accent" : ""}`} />
            {loading ? "Checking..." : "Refresh Status"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((svc) => (
            <div
              key={svc.name}
              className="rounded-xl border border-border bg-surface p-5 space-y-3 transition-colors hover:border-accent/40 shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-surface-muted border border-border text-accent">
                    <svc.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{svc.name}</h4>
                    <p className="text-xs text-muted-foreground">{svc.role}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize border ${
                    svc.status === "healthy" || svc.status === "online"
                      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"
                      : svc.status === "checking..." || svc.status === "connecting"
                      ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800"
                      : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                      svc.status === "healthy" || svc.status === "online"
                        ? "bg-green-500"
                        : svc.status === "checking..." || svc.status === "connecting"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  />
                  {svc.status}
                  {svc.latency !== undefined && svc.latency !== null ? ` (${svc.latency}ms)` : ""}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-normal">{svc.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Retrieval Pipeline Modules Preview */}
      <section className="rounded-xl border border-border bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            NexusAI Architecture Roadmap
          </h3>
          <span className="text-xs text-muted-foreground font-medium">Vertical Slice Implementation</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center text-xs">
          <div className="p-3 rounded-lg border border-green-500/40 bg-green-500/10 space-y-1">
            <span className="font-semibold block text-green-600 dark:text-green-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Phase 0
            </span>
            <span className="text-foreground text-[11px]">Infra & Health</span>
          </div>

          <div className="p-3 rounded-lg border border-green-500/40 bg-green-500/10 space-y-1">
            <span className="font-semibold block text-green-600 dark:text-green-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Phase 1
            </span>
            <span className="text-foreground text-[11px]">Auth & Tenancy</span>
          </div>

          <div className="p-3 rounded-lg border border-accent bg-accent/15 space-y-1 ring-1 ring-accent/30">
            <span className="font-semibold block text-accent flex items-center justify-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Phase 2
            </span>
            <span className="text-foreground font-medium text-[11px]">Async Ingestion</span>
          </div>

          <div className="p-3 rounded-lg border border-border bg-surface-muted space-y-1">
            <span className="font-semibold block text-muted-foreground">Phase 3</span>
            <span className="text-muted-foreground text-[11px]">Dense Vectors</span>
          </div>

          <div className="p-3 rounded-lg border border-border bg-surface-muted space-y-1">
            <span className="font-semibold block text-muted-foreground">Phase 4-5</span>
            <span className="text-muted-foreground text-[11px]">FTS & Fusion</span>
          </div>

          <div className="p-3 rounded-lg border border-border bg-surface-muted space-y-1">
            <span className="font-semibold block text-muted-foreground">Phase 6-10</span>
            <span className="text-muted-foreground text-[11px]">Graph & Agent</span>
          </div>
        </div>
      </section>
    </div>
  );
}
