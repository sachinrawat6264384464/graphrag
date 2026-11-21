"use client";

import { useState } from "react";
import { Share2, Sparkles, Filter, Info, ShieldCheck, Database, Layers } from "lucide-react";

interface GraphNode {
  id: string;
  name: string;
  type: "Concept" | "Database" | "Architecture" | "Security";
  x: number;
  y: number;
  color: string;
  connections: string[];
  description: string;
}

export function GraphView() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>("All");

  const nodes: GraphNode[] = [
    {
      id: "node-1",
      name: "NexusAI Platform",
      type: "Architecture",
      x: 350,
      y: 180,
      color: "#2563EB",
      connections: ["node-2", "node-3", "node-4", "node-5", "node-6"],
      description: "Enterprise hybrid RAG and GraphRAG knowledge orchestration platform.",
    },
    {
      id: "node-2",
      name: "PostgreSQL pgvector",
      type: "Database",
      x: 180,
      y: 90,
      color: "#059669",
      connections: ["node-1", "node-4"],
      description: "Stores relational metadata, multi-tenant records, and HNSW dense embeddings.",
    },
    {
      id: "node-3",
      name: "Neo4j Graph Database",
      type: "Database",
      x: 520,
      y: 90,
      color: "#7C3AED",
      connections: ["node-1", "node-5"],
      description: "Stores entity-relation knowledge graphs and executes multi-hop Cypher queries.",
    },
    {
      id: "node-4",
      name: "Dense Semantic Search",
      type: "Concept",
      x: 140,
      y: 280,
      color: "#0284C7",
      connections: ["node-1", "node-2"],
      description: "Cosine distance vector similarity retrieval on chunk embeddings.",
    },
    {
      id: "node-5",
      name: "GraphRAG Traversal",
      type: "Concept",
      x: 560,
      y: 280,
      color: "#D97706",
      connections: ["node-1", "node-3"],
      description: "Extracts sub-graphs up to 2-hop depth to ground multi-entity queries.",
    },
    {
      id: "node-6",
      name: "Multi-Tenant Isolation",
      type: "Security",
      x: 350,
      y: 340,
      color: "#DC2626",
      connections: ["node-1"],
      description: "Workspace-level boundaries enforced across relational and graph models.",
    },
  ];

  const filteredNodes =
    filterType === "All" ? nodes : nodes.filter((n) => n.type === filterType);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Knowledge Graph Intelligence</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Phase 6 Pipeline Preview: Entity-relation graphs, multi-hop sub-graph traversal, and Neo4j integration.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="inline-flex items-center p-0.5 rounded-lg border border-border bg-surface text-xs">
            {["All", "Architecture", "Database", "Concept", "Security"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  filterType === type
                    ? "bg-accent text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Canvas & Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Visual Graph Canvas */}
        <div className="lg:col-span-3 rounded-xl border border-border bg-surface p-4 relative overflow-hidden shadow-xs min-h-[420px] flex items-center justify-center">
          <svg className="w-full h-[400px]" viewBox="0 0 700 400">
            <defs>
              <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Connecting Lines */}
            <line x1="350" y1="180" x2="180" y2="90" stroke="url(#edgeGrad)" strokeWidth="2" strokeDasharray="4 2" />
            <line x1="350" y1="180" x2="520" y2="90" stroke="url(#edgeGrad)" strokeWidth="2" strokeDasharray="4 2" />
            <line x1="350" y1="180" x2="140" y2="280" stroke="url(#edgeGrad)" strokeWidth="2" strokeDasharray="4 2" />
            <line x1="350" y1="180" x2="560" y2="280" stroke="url(#edgeGrad)" strokeWidth="2" strokeDasharray="4 2" />
            <line x1="350" y1="180" x2="350" y2="340" stroke="url(#edgeGrad)" strokeWidth="2" strokeDasharray="4 2" />
            <line x1="180" y1="90" x2="140" y2="280" stroke="#059669" strokeOpacity="0.3" strokeWidth="1.5" />
            <line x1="520" y1="90" x2="560" y2="280" stroke="#7C3AED" strokeOpacity="0.3" strokeWidth="1.5" />

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
                    fillOpacity={isSelected ? 0.9 : 0.75}
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
                    className="text-foreground font-medium"
                    pointerEvents="none"
                  >
                    {node.name}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Quick Watermark Note */}
          <div className="absolute bottom-3 left-4 text-[10px] text-muted-foreground flex items-center gap-1.5 bg-surface/80 px-2 py-1 rounded border border-border">
            <Info className="h-3 w-3 text-accent" />
            <span>Interactive graph topology (Click nodes to inspect attributes)</span>
          </div>
        </div>

        {/* Selected Node Details Panel */}
        <div className="rounded-xl border border-border bg-surface p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Share2 className="h-4 w-4 text-accent" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">
              Node Inspector
            </h3>
          </div>

          {selectedNode ? (
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Entity Name</span>
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
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Degree Centrality</span>
                <p className="font-mono text-xs text-foreground mt-0.5">
                  {selectedNode.connections.length} edges connected
                </p>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground space-y-2">
              <Share2 className="h-6 w-6 mx-auto opacity-40 text-accent" />
              <p className="text-xs">Click on any graph node to inspect its attributes, relationships, and Cypher properties.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
