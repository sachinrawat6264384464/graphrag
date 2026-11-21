"use client";

import { useState } from "react";
import {
  Share2,
  Sparkles,
  Filter,
  Info,
  Database,
  Layers,
  Plus,
  Play,
  Code2,
  CheckCircle2,
  Cpu,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

interface GraphNode {
  id: string;
  name: string;
  type: "Architecture" | "Database" | "Concept" | "Security" | "Model";
  x: number;
  y: number;
  color: string;
  connections: string[];
  description: string;
}

interface GraphTriple {
  id: string;
  subject: string;
  predicate: string;
  object: string;
  sourceChunk: string;
  confidence: number;
}

export function GraphView() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>("All");
  const [extracting, setExtracting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"visual" | "triples" | "cypher">("visual");

  const [nodes, setNodes] = useState<GraphNode[]>([
    {
      id: "node-1",
      name: "NexusAI",
      type: "Architecture",
      x: 350,
      y: 190,
      color: "#2563EB",
      connections: ["node-2", "node-3", "node-4", "node-5", "node-6"],
      description: "Enterprise hybrid RAG and GraphRAG knowledge orchestration platform.",
    },
    {
      id: "node-2",
      name: "pgvector",
      type: "Database",
      x: 180,
      y: 90,
      color: "#059669",
      connections: ["node-1", "node-4"],
      description: "Stores relational metadata, multi-tenant records, and HNSW dense embeddings.",
    },
    {
      id: "node-3",
      name: "Neo4j Graph",
      type: "Database",
      x: 520,
      y: 90,
      color: "#7C3AED",
      connections: ["node-1", "node-5"],
      description: "Stores entity-relation knowledge graphs and executes multi-hop Cypher queries.",
    },
    {
      id: "node-4",
      name: "Dense Semantic",
      type: "Concept",
      x: 140,
      y: 290,
      color: "#0284C7",
      connections: ["node-1", "node-2"],
      description: "Cosine distance vector similarity retrieval on chunk embeddings.",
    },
    {
      id: "node-5",
      name: "GraphRAG Traversal",
      type: "Concept",
      x: 560,
      y: 290,
      color: "#D97706",
      connections: ["node-1", "node-3"],
      description: "Extracts sub-graphs up to 2-hop depth to ground multi-entity queries.",
    },
    {
      id: "node-6",
      name: "Multi-Tenant RBAC",
      type: "Security",
      x: 350,
      y: 350,
      color: "#DC2626",
      connections: ["node-1"],
      description: "Workspace-level boundaries enforced across relational and graph models.",
    },
  ]);

  const [triples, setTriples] = useState<GraphTriple[]>([
    {
      id: "t-1",
      subject: "NexusAI",
      predicate: "USES",
      object: "pgvector",
      sourceChunk: "Chunk #1 (Architecture)",
      confidence: 0.98,
    },
    {
      id: "t-2",
      subject: "NexusAI",
      predicate: "INTEGRATES",
      object: "Neo4j Graph",
      sourceChunk: "Chunk #1 (Architecture)",
      confidence: 0.97,
    },
    {
      id: "t-3",
      subject: "pgvector",
      predicate: "POWERS",
      object: "Dense Semantic",
      sourceChunk: "Chunk #2 (Vectors)",
      confidence: 0.95,
    },
    {
      id: "t-4",
      subject: "Neo4j Graph",
      predicate: "ENABLES",
      object: "GraphRAG Traversal",
      sourceChunk: "Chunk #3 (Knowledge Graph)",
      confidence: 0.96,
    },
    {
      id: "t-5",
      subject: "NexusAI",
      predicate: "ENFORCES",
      object: "Multi-Tenant RBAC",
      sourceChunk: "Chunk #4 (Security)",
      confidence: 0.99,
    },
  ]);

  const handleSimulateExtraction = () => {
    setExtracting(true);
    setTimeout(() => {
      // Add new node dynamically
      const newNode: GraphNode = {
        id: `node-${Date.now()}`,
        name: "Reciprocal Rank Fusion",
        type: "Concept",
        x: 350,
        y: 80,
        color: "#EC4899",
        connections: ["node-1", "node-4"],
        description: "Mathematically merges dense vector ranks with sparse keyword ranks via 1/(60+r).",
      };

      const newTriple: GraphTriple = {
        id: `t-${Date.now()}`,
        subject: "NexusAI",
        predicate: "FUSES_VIA",
        object: "Reciprocal Rank Fusion",
        sourceChunk: "Extracted from Ingested Sample",
        confidence: 0.96,
      };

      setNodes((prev) => [...prev, newNode]);
      setTriples((prev) => [newTriple, ...prev]);
      setSelectedNode(newNode);
      setExtracting(false);
    }, 1200);
  };

  const filteredNodes =
    filterType === "All" ? nodes : nodes.filter((n) => n.type === filterType);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20 mb-1.5">
            <Share2 className="h-3.5 w-3.5" />
            <span>GraphRAG Engine (Phase 6 Architecture)</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Neo4j Property Graph & Multi-Hop Traversal</h2>
          <p className="text-xs text-muted-foreground">
            Visual representation of how entities and relations are extracted, stored as triples, and traversed in Neo4j.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSimulateExtraction}
            disabled={extracting}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-accent text-white hover:bg-accent/90 transition-all cursor-pointer shadow-xs disabled:opacity-60"
          >
            <Sparkles className={`h-3.5 w-3.5 ${extracting ? "animate-spin" : ""}`} />
            <span>{extracting ? "Extracting Entities..." : "Extract Entities from Chunks"}</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs: Visual Canvas, Triples Table, Cypher Queries */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="inline-flex items-center p-1 rounded-lg border border-border bg-surface text-xs font-medium">
          <button
            onClick={() => setActiveTab("visual")}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === "visual" ? "bg-accent text-white font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Visual Graph Canvas ({nodes.length} Nodes)
          </button>
          <button
            onClick={() => setActiveTab("triples")}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === "triples" ? "bg-accent text-white font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Knowledge Triples Table ({triples.length} Relations)
          </button>
          <button
            onClick={() => setActiveTab("cypher")}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === "cypher" ? "bg-accent text-white font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Raw Cypher Database Queries
          </button>
        </div>

        {activeTab === "visual" && (
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-foreground focus:border-accent focus:outline-none"
            >
              {["All", "Architecture", "Database", "Concept", "Security"].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: VISUAL CANVAS */}
      {activeTab === "visual" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 rounded-xl border border-border bg-surface p-4 relative overflow-hidden shadow-xs min-h-[440px] flex items-center justify-center">
            <svg className="w-full h-[420px]" viewBox="0 0 700 420">
              <defs>
                <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Connecting Lines */}
              <line x1="350" y1="190" x2="180" y2="90" stroke="url(#edgeGrad)" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="350" y1="190" x2="520" y2="90" stroke="url(#edgeGrad)" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="350" y1="190" x2="140" y2="290" stroke="url(#edgeGrad)" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="350" y1="190" x2="560" y2="290" stroke="url(#edgeGrad)" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="350" y1="190" x2="350" y2="350" stroke="url(#edgeGrad)" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="180" y1="90" x2="140" y2="290" stroke="#059669" strokeOpacity="0.3" strokeWidth="1.5" />
              <line x1="520" y1="90" x2="560" y2="290" stroke="#7C3AED" strokeOpacity="0.3" strokeWidth="1.5" />
              {nodes.length > 6 && (
                <line x1="350" y1="190" x2="350" y2="80" stroke="#EC4899" strokeWidth="2" strokeDasharray="3 3" />
              )}

              {/* Render Nodes */}
              {filteredNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer transition-transform hover:scale-105"
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.id === "node-1" ? 36 : 28}
                      fill={node.color}
                      fillOpacity={isSelected ? 0.95 : 0.75}
                      stroke={isSelected ? "#FFFFFF" : node.color}
                      strokeWidth={isSelected ? 3 : 1}
                      className="transition-all"
                    />
                    <text
                      x={node.x}
                      y={node.y + 4}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize={node.id === "node-1" ? "10" : "9"}
                      fontWeight="bold"
                      pointerEvents="none"
                    >
                      {node.name.split(" ")[0]}
                    </text>
                    <text
                      x={node.x}
                      y={node.y + (node.id === "node-1" ? 48 : 40)}
                      textAnchor="middle"
                      fill="currentColor"
                      fontSize="11"
                      className="text-foreground font-semibold"
                      pointerEvents="none"
                    >
                      {node.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="absolute bottom-3 left-4 text-[10px] text-muted-foreground flex items-center gap-1.5 bg-surface/80 px-2.5 py-1 rounded border border-border">
              <Info className="h-3 w-3 text-accent" />
              <span>Click on any node to view entity attributes and Cypher properties</span>
            </div>
          </div>

          {/* Node Inspector */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <Share2 className="h-4 w-4 text-accent" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">
                Entity Inspector
              </h3>
            </div>

            {selectedNode ? (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Entity Label</span>
                  <p className="font-bold text-sm text-foreground">{selectedNode.name}</p>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Classification</span>
                  <div className="mt-1">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold text-white"
                      style={{ backgroundColor: selectedNode.color }}
                    >
                      {selectedNode.type}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Description</span>
                  <p className="text-muted-foreground text-xs leading-relaxed mt-1">
                    {selectedNode.description}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Neo4j Degree</span>
                  <p className="font-mono text-xs text-foreground mt-0.5">
                    {selectedNode.connections.length} relational edges
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-surface-muted border border-border text-[11px] font-mono text-muted-foreground">
                  MATCH (n:Entity &#123;name: '{selectedNode.name}'&#125;) RETURN n;
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground space-y-2">
                <Share2 className="h-6 w-6 mx-auto opacity-40 text-accent" />
                <p className="text-xs">Click on any graph node to inspect its attributes, relationships, and Cypher properties.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: KNOWLEDGE TRIPLES TABLE */}
      {activeTab === "triples" && (
        <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-muted/60 text-muted-foreground font-medium">
                  <th className="py-3 px-4">Subject (Entity 1)</th>
                  <th className="py-3 px-4">Predicate (Relationship)</th>
                  <th className="py-3 px-4">Object (Entity 2)</th>
                  <th className="py-3 px-4">Source Provenance</th>
                  <th className="py-3 px-4 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {triples.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-muted/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-accent">{t.subject}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        [:{t.predicate}]
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-foreground">{t.object}</td>
                    <td className="py-3 px-4 text-muted-foreground">{t.sourceChunk}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-green-600 dark:text-green-400">
                      {(t.confidence * 100).toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CYPHER QUERIES SANDBOX */}
      {activeTab === "cypher" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border border-border bg-surface space-y-3">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-accent" />
              <h4 className="font-bold text-xs text-foreground">1. Ingestion: Write Triples to Neo4j</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Executed during document chunk processing when entities are extracted:
            </p>
            <pre className="p-3.5 rounded-lg bg-surface-muted border border-border text-[11px] font-mono text-foreground leading-relaxed overflow-x-auto">
{`MERGE (s:Entity {name: $subject, workspace_id: $ws_id})
MERGE (o:Entity {name: $object, workspace_id: $ws_id})
MERGE (s)-[r:RELATION {type: $rel_type}]->(o)
SET r.chunk_id = $chunk_id,
    r.confidence = $score,
    r.updated_at = datetime()
RETURN s, r, o;`}
            </pre>
          </div>

          <div className="p-5 rounded-xl border border-border bg-surface space-y-3">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-accent" />
              <h4 className="font-bold text-xs text-foreground">2. Retrieval: 2-Hop GraphRAG Traversal</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Executed during query processing to discover relational context:
            </p>
            <pre className="p-3.5 rounded-lg bg-surface-muted border border-border text-[11px] font-mono text-foreground leading-relaxed overflow-x-auto">
{`MATCH (seed:Entity {workspace_id: $ws_id})
WHERE seed.name IN $query_entities
MATCH path = (seed)-[r:RELATION*1..2]-(target:Entity)
RETURN path,
       length(path) AS distance,
       [rel IN relationships(path) | rel.chunk_id] AS chunks
ORDER BY distance ASC
LIMIT 25;`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
