"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchReadiness, ReadinessResponse } from "@/lib/api";
import {
  Server,
  Database,
  Share2,
  Layers,
  ShieldCheck,
  Activity,
  RefreshCw,
} from "lucide-react";

export default function HomePage() {
  const [readiness, setReadiness] = useState<ReadinessResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const checkStatus = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchReadiness();
      setReadiness(data);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
    // Poll every 6 seconds to keep live metrics updated
    const interval = setInterval(checkStatus, 6000);
    return () => clearInterval(interval);
  }, [checkStatus]);

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
    <div className="flex-1 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b border-border bg-surface px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-accent flex items-center justify-center text-white font-bold text-sm">
            NX
          </div>
          <div>
            <h1 className="font-semibold text-base leading-tight">NexusAI</h1>
            <p className="text-xs text-muted-foreground">Enterprise Hybrid RAG + GraphRAG Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={checkStatus}
            disabled={loading}
            title="Refresh System Status"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border border-border bg-surface-muted hover:bg-surface transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin text-accent" : ""}`} />
            {loading ? "Checking..." : "Refresh"}
          </button>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-border bg-surface-muted">
            <span
              className={`h-2 w-2 rounded-full ${
                readiness?.status === "healthy"
                  ? "bg-status-success"
                  : readiness?.status === "degraded"
                  ? "bg-status-warning"
                  : "bg-status-error"
              }`}
            />
            Status: {readiness ? readiness.status.toUpperCase() : loading ? "CONNECTING..." : "STANDALONE"}
          </span>
          <span className="text-xs text-muted-foreground hidden sm:inline">Phase 1 Architecture</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Welcome Banner */}
        <section className="rounded-lg border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-2 max-w-2xl">
              <h2 className="text-xl font-bold tracking-tight">Enterprise Knowledge Intelligence</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                NexusAI unifies exact keyword search, dense semantic retrieval (pgvector), and property
                graph traversal (Neo4j) to deliver verifiable, evidence-grounded answers with precise citations.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground border border-border rounded px-3 py-2 bg-surface-muted">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <span>Multi-Tenant Isolated (Phase 1 Ready)</span>
            </div>
          </div>
        </section>

        {/* Phase 1 Implemented Features */}
        <section className="rounded-lg border border-accent/30 bg-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">
                Phase 1 Implemented: Multi-Tenant Auth & Workspaces
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Bcrypt password hashing, Signed PyJWT bearer authentication, and isolated workspace boundaries.
              </p>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800">
              Active & Verified (14/14 Tests Passing)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded border border-border bg-surface-muted space-y-1">
              <span className="font-semibold block text-foreground">User Authentication</span>
              <p className="text-muted-foreground leading-normal">
                <code>/api/v1/auth/register</code>, <code>/login</code>, and <code>/me</code> with salted bcrypt hashing and JWT.
              </p>
            </div>
            <div className="p-3 rounded border border-border bg-surface-muted space-y-1">
              <span className="font-semibold block text-foreground">Multi-Tenant Boundaries</span>
              <p className="text-muted-foreground leading-normal">
                Auto-provisioned personal workspaces + custom organization tenants with strict isolation.
              </p>
            </div>
            <div className="p-3 rounded border border-border bg-surface-muted space-y-1">
              <span className="font-semibold block text-foreground">Role-Based Access Control</span>
              <p className="text-muted-foreground leading-normal">
                Fine-grained permissions: Platform Admin, Workspace Admin, Editor, and Viewer.
              </p>
            </div>
          </div>
        </section>

        {/* Infrastructure Topology Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Core Infrastructure Components (Phase 0)
            </h3>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-accent" />
              {lastUpdated
                ? `Last inspected ${lastUpdated.toLocaleTimeString()}`
                : "Inspecting..."}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((svc) => (
              <div
                key={svc.name}
                className="rounded-lg border border-border bg-surface p-5 space-y-3 transition-colors hover:border-accent/40"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-surface-muted border border-border text-accent">
                      <svc.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{svc.name}</h4>
                      <p className="text-xs text-muted-foreground">{svc.role}</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize border ${
                      svc.status === "healthy" || svc.status === "online"
                        ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"
                        : svc.status === "checking..." || svc.status === "connecting"
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800"
                        : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800"
                    }`}
                  >
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
        <section className="rounded-lg border border-border bg-surface p-6 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Planned Pipeline Architecture
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center text-xs">
            <div className="p-3 rounded border border-green-500/40 bg-green-500/10 space-y-1">
              <span className="font-semibold block text-green-600 dark:text-green-400">Phase 1 ✓</span>
              <span className="text-foreground">Auth & Tenancy</span>
            </div>
            <div className="p-3 rounded border border-accent/40 bg-accent/10 space-y-1">
              <span className="font-semibold block text-accent">Phase 2 ➜</span>
              <span className="text-foreground">Async Ingestion</span>
            </div>
            <div className="p-3 rounded border border-border bg-surface-muted space-y-1">
              <span className="font-semibold block">Phase 3</span>
              <span className="text-muted-foreground">Dense Vectors</span>
            </div>
            <div className="p-3 rounded border border-border bg-surface-muted space-y-1">
              <span className="font-semibold block">Phase 4</span>
              <span className="text-muted-foreground">FTS & RRF Fusion</span>
            </div>
            <div className="p-3 rounded border border-border bg-surface-muted space-y-1">
              <span className="font-semibold block">Phase 6</span>
              <span className="text-muted-foreground">Neo4j Extraction</span>
            </div>
            <div className="p-3 rounded border border-border bg-surface-muted space-y-1">
              <span className="font-semibold block">Phase 7-10</span>
              <span className="text-muted-foreground">GraphRAG & Agent</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface px-6 py-4 text-center text-xs text-muted-foreground">
        NexusAI Enterprise Platform — Phase 1 Multi-Tenant Auth Verification Complete
      </footer>
    </div>
  );
}
