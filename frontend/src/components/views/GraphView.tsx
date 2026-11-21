"use client";

import { useEffect, useState } from "react";
import {
  fetchKnowledgeGraphApi,
  extractGraphApi,
  traverseGraphApi,
  GraphNode,
  GraphEdge,
  GraphStats,
  TraversalResult,
} from "@/lib/api";
import {
  Share2,
  Sparkles,
  Filter,
  Info,
  Database,
  Layers,
  Play,
  Code2,
  CheckCircle2,
  Cpu,
  ArrowRight,
  RefreshCw,
  Search,
  Zap,
  Route,
  FileText,
  AlertCircle,
} from "lucide-react";

interface GraphViewProps {
  workspaceId: string | null;
  token: string | null;
  onOpenAuth: () => void;
}

export function GraphView({ workspaceId, token, onOpenAuth }: GraphViewProps) {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [stats, setStats] = useState<GraphStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<"visual" | "traversal" | "triples" | "cypher">("visual");

  // Real Extraction State
  const [extracting, setExtracting] = useState<boolean>(false);
  const [customText, setCustomText] = useState<string>("");
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [extractionSuccess, setExtractionSuccess] = useState<string | null>(null);

  // Real Traversal State
  const [sourceNode, setSourceNode] = useState<string>("NexusAI");
  const [targetNode, setTargetNode] = useState<string>("Dense Semantic Retrieval");
  const [traversing, setTraversing] = useState<boolean>(false);
  const [traversalResult, setTraversalResult] = useState<TraversalResult | null>(null);

  // Load real graph from backend API
  const loadGraph = async () => {
    if (!workspaceId || !token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchKnowledgeGraphApi(workspaceId, token);
      setNodes(data.nodes);
      setEdges(data.edges);
      setStats(data.stats);
      if (data.nodes.length > 0) {
        setSelectedNode(data.nodes[0]);
      }
    } catch {
      // Keep previous
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGraph();
  }, [workspaceId, token]);

  // Execute real extraction on backend
  const handleRunRealExtraction = async (textToExtract?: string) => {
    if (!token || !workspaceId) {
      onOpenAuth();
      return;
    }

    setExtracting(true);
    setExtractionSuccess(null);
    try {
      const res = await extractGraphApi(
        workspaceId,
        {
          rawText:
            textToExtract ||
            customText ||
            "NexusAI implements hybrid RAG. It stores metadata in PostgreSQL and uses pgvector for HNSW indexing. Knowledge Triples are persisted in Neo4j to enable multi-hop GraphRAG Traversal. Dense Semantic Retrieval is fused with Sparse Lexical Search via Reciprocal Rank Fusion.",
        },
        token
      );
      setNodes(res.graph.nodes);
      setEdges(res.graph.edges);
      setStats(res.graph.stats);
      setExtractionSuccess(
        `Success! Extracted ${res.triples.length} real relationship triples across ${res.graph.nodes.length} entities.`
      );
      setTimeout(() => setExtractionSuccess(null), 5000);
      setShowCustomInput(false);
      setCustomText("");
    } catch (err: any) {
      alert(err.message || "Extraction failed");
    } finally {
      setExtracting(false);
    }
  };

  // Execute real multi-hop pathfinding traversal on backend
  const handleRunRealTraversal = async () => {
    if (!token || !workspaceId) {
      onOpenAuth();
      return;
    }

    setTraversing(true);
    try {
      const res = await traverseGraphApi(
        workspaceId,
        { sourceEntity: sourceNode, targetEntity: targetNode, maxDepth: 3 },
        token
      );
      setTraversalResult(res);
      setActiveTab("traversal");
    } catch (err: any) {
      alert(err.message || "Traversal failed");
    } finally {
      setTraversing(false);
    }
  };

  const filteredNodes =
    filterType === "All" ? nodes : nodes.filter((n) => n.type === filterType);

  const isNodeOnPath = (nodeName: string) => {
    return traversalResult?.path_nodes.includes(nodeName);
  };

  const isEdgeOnPath = (u: string, v: string) => {
    if (!traversalResult || !traversalResult.path_nodes) return false;
    const p = traversalResult.path_nodes;
    for (let i = 0; i < p.length - 1; i++) {
      if ((p[i] === u && p[i + 1] === v) || (p[i] === v && p[i + 1] === u)) return true;
    }
    return false;
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 mb-1.5">
            <Share2 className="h-3.5 w-3.5" />
            <span>Real GraphRAG Engine • NetworkX + Neo4j Protocol</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Knowledge Graph & Multi-Hop Traversal</h2>
          <p className="text-xs text-muted-foreground">
            Real working GraphRAG: Extract entities from documents, store knowledge triples, and traverse multi-hop relational paths.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-surface hover:bg-surface-muted transition-colors cursor-pointer"
          >
            {showCustomInput ? "Cancel Custom Text" : "Extract Custom Text"}
          </button>

          <button
            onClick={() => handleRunRealExtraction()}
            disabled={extracting}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-all cursor-pointer shadow-xs disabled:opacity-60"
          >
            <Sparkles className={`h-3.5 w-3.5 ${extracting ? "animate-spin" : ""}`} />
            <span>{extracting ? "Extracting Triples..." : "Run Real Graph Extraction"}</span>
          </button>
        </div>
      </div>

      {/* Extraction Success Banner */}
      {extractionSuccess && (
        <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{extractionSuccess}</span>
        </div>
      )}

      {/* Custom Text Ingestion Box */}
      {showCustomInput && (
        <div className="p-4 rounded-xl border border-purple-500/40 bg-purple-500/5 space-y-3">
          <h4 className="text-xs font-bold text-foreground">Extract Knowledge Triples from Custom Text</h4>
          <textarea
            rows={3}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Paste or type technical text to extract real entities and relations (e.g. 'NexusAI uses FastAPI. FastAPI connects to PostgreSQL which enables pgvector')..."
            className="w-full rounded-lg border border-border bg-surface p-3 text-xs focus:border-purple-500 focus:outline-none"
          />
          <div className="flex justify-end">
            <button
              onClick={() => handleRunRealExtraction(customText)}
              disabled={extracting || !customText.trim()}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 cursor-pointer"
            >
              Extract & Update Graph
            </button>
          </div>
        </div>
      )}

      {/* Multi-Hop Pathfinding Traversal Bar */}
      <div className="rounded-xl border border-border bg-surface p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Route className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-foreground">Multi-Hop Pathfinding (GraphRAG Reasoner)</h4>
              <p className="text-[11px] text-muted-foreground">
                Find shortest relational chain connecting two concepts across hops
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground font-medium text-[11px]">From:</span>
              <select
                value={sourceNode}
                onChange={(e) => setSourceNode(e.target.value)}
                className="rounded-md border border-border bg-surface-muted px-2.5 py-1 text-xs text-foreground font-semibold"
              >
                {nodes.map((n) => (
                  <option key={n.id} value={n.name}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground font-medium text-[11px]">To:</span>
              <select
                value={targetNode}
                onChange={(e) => setTargetNode(e.target.value)}
                className="rounded-md border border-border bg-surface-muted px-2.5 py-1 text-xs text-foreground font-semibold"
              >
                {nodes.map((n) => (
                  <option key={n.id} value={n.name}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleRunRealTraversal}
              disabled={traversing || nodes.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Play className={`h-3 w-3 ${traversing ? "animate-spin" : ""}`} />
              <span>{traversing ? "Traversing..." : "Traverse Path"}</span>
            </button>
          </div>
        </div>

        {/* Traversal Result Live Explainer */}
        {traversalResult && (
          <div className="p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Relational Path Discovered ({traversalResult.path_nodes.length - 1} Hops)
              </span>
              <span className="font-mono text-muted-foreground">
                Depth: {traversalResult.path_nodes.length - 1} hops
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto py-1 font-mono text-xs font-bold">
              {traversalResult.path_nodes.map((node, i) => (
                <div key={i} className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded bg-amber-500 text-white shadow-2xs">
                    {node}
                  </span>
                  {i < traversalResult.path_nodes.length - 1 && (
                    <span className="text-amber-500 text-sm font-bold">&rarr;</span>
                  )}
                </div>
              ))}
            </div>

            <p className="text-muted-foreground text-[11px] leading-relaxed pt-1">
              {traversalResult.reasoning}
            </p>
          </div>
        )}
      </div>

      {/* Sub Tabs: Visual Canvas, Triples Table, Cypher Queries */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="inline-flex items-center p-1 rounded-lg border border-border bg-surface text-xs font-medium">
          <button
            onClick={() => setActiveTab("visual")}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === "visual"
                ? "bg-purple-600 text-white font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Visual Graph Canvas ({nodes.length} Nodes, {edges.length} Edges)
          </button>
          <button
            onClick={() => setActiveTab("triples")}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === "triples"
                ? "bg-purple-600 text-white font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Knowledge Triples Table ({edges.length} Relations)
          </button>
          <button
            onClick={() => setActiveTab("cypher")}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === "cypher"
                ? "bg-purple-600 text-white font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Raw Neo4j Cypher Code
          </button>
        </div>

        {activeTab === "visual" && (
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-foreground focus:border-purple-500 focus:outline-none"
            >
              {["All", "Architecture", "Database", "Concept", "Security", "Algorithm", "Component"].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: REAL VISUAL SVG CANVAS */}
      {activeTab === "visual" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 rounded-xl border border-border bg-surface p-4 relative overflow-hidden shadow-xs min-h-[460px] flex items-center justify-center">
            {loading ? (
              <div className="py-16 text-center text-muted-foreground space-y-2">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-purple-600" />
                <p className="text-xs">Loading real workspace knowledge graph...</p>
              </div>
            ) : (
              <svg className="w-full h-[440px]" viewBox="0 0 700 420">
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="8"
                    markerHeight="6"
                    refX="16"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="#8B5CF6" opacity="0.6" />
                  </marker>
                  <marker
                    id="arrowhead-highlight"
                    markerWidth="10"
                    markerHeight="8"
                    refX="18"
                    refY="4"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 4, 0 8" fill="#F59E0B" />
                  </marker>
                </defs>

                {/* Render Edges */}
                {edges.map((e, idx) => {
                  const sNode = nodes.find((n) => n.id === e.source);
                  const tNode = nodes.find((n) => n.id === e.target);
                  if (!sNode || !tNode) return null;

                  const highlighted = isEdgeOnPath(e.source, e.target);

                  return (
                    <g key={e.id || idx}>
                      <line
                        x1={sNode.x || 350}
                        y1={sNode.y || 200}
                        x2={tNode.x || 350}
                        y2={tNode.y || 200}
                        stroke={highlighted ? "#F59E0B" : "#8B5CF6"}
                        strokeWidth={highlighted ? 3.5 : 1.2}
                        strokeOpacity={highlighted ? 1 : 0.4}
                        strokeDasharray={highlighted ? "" : "4 2"}
                        markerEnd={highlighted ? "url(#arrowhead-highlight)" : "url(#arrowhead)"}
                        className="transition-all"
                      />
                      {highlighted && (
                        <text
                          x={((sNode.x || 350) + (tNode.x || 350)) / 2}
                          y={((sNode.y || 200) + (tNode.y || 200)) / 2 - 5}
                          fill="#F59E0B"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                          className="bg-surface"
                        >
                          {e.predicate}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Render Nodes */}
                {filteredNodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id;
                  const onPath = isNodeOnPath(node.name);

                  return (
                    <g
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className="cursor-pointer transition-transform hover:scale-105"
                    >
                      <circle
                        cx={node.x || 350}
                        cy={node.y || 200}
                        r={onPath ? 30 : isSelected ? 26 : 22}
                        fill={onPath ? "#F59E0B" : node.color || "#3B82F6"}
                        fillOpacity={onPath ? 1 : isSelected ? 0.95 : 0.8}
                        stroke={onPath ? "#FFFFFF" : isSelected ? "#FFFFFF" : "#1E293B"}
                        strokeWidth={onPath ? 3.5 : isSelected ? 2.5 : 1}
                        className="transition-all"
                      />
                      <text
                        x={node.x || 350}
                        y={(node.y || 200) + 4}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="8"
                        fontWeight="bold"
                        pointerEvents="none"
                      >
                        {node.name.slice(0, 8)}
                      </text>
                      <text
                        x={node.x || 350}
                        y={(node.y || 200) + 32}
                        textAnchor="middle"
                        fill="currentColor"
                        fontSize="10"
                        className="text-foreground font-semibold"
                        pointerEvents="none"
                      >
                        {node.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}

            <div className="absolute bottom-3 left-4 text-[10px] text-muted-foreground flex items-center gap-1.5 bg-surface/80 px-2.5 py-1 rounded border border-border">
              <Info className="h-3 w-3 text-purple-500" />
              <span>Real graph nodes & edges (Click any node to view entity attributes)</span>
            </div>
          </div>

          {/* Real Node Inspector Panel */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <Share2 className="h-4 w-4 text-purple-600" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">
                Entity Inspector
              </h3>
            </div>

            {selectedNode ? (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                    Entity Name
                  </span>
                  <p className="font-bold text-sm text-foreground">{selectedNode.name}</p>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                    Classification
                  </span>
                  <div className="mt-1">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold text-white"
                      style={{ backgroundColor: selectedNode.color || "#3B82F6" }}
                    >
                      {selectedNode.type}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                    Description
                  </span>
                  <p className="text-muted-foreground text-xs leading-relaxed mt-1">
                    {selectedNode.description || "No detailed description available."}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                    Graph Centrality
                  </span>
                  <p className="font-mono text-xs text-foreground mt-0.5">
                    Degree: {selectedNode.degree} connected relations
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-surface-muted border border-border text-[11px] font-mono text-muted-foreground">
                  MATCH (n:Entity &#123;name: '{selectedNode.name}'&#125;) RETURN n;
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground space-y-2">
                <Share2 className="h-6 w-6 mx-auto opacity-40 text-purple-600" />
                <p className="text-xs">Click any graph node to inspect real database properties.</p>
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
                  <th className="py-3 px-4">Context Description</th>
                  <th className="py-3 px-4">Source Provenance</th>
                  <th className="py-3 px-4 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {edges.map((e, idx) => (
                  <tr key={e.id || idx} className="hover:bg-surface-muted/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-purple-600 dark:text-purple-400">{e.source}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        [:{e.predicate}]
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-foreground">{e.target}</td>
                    <td className="py-3 px-4 text-muted-foreground text-[11px] max-w-xs truncate">
                      {e.description || "Semantic relation extracted from workspace chunks."}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-mono text-[10px]">
                      {e.chunk_id || "seed-core"}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-green-600 dark:text-green-400">
                      {((e.confidence || 0.95) * 100).toFixed(0)}%
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
              <Code2 className="h-4 w-4 text-purple-600" />
              <h4 className="font-bold text-xs text-foreground">1. Ingestion: Write Triples to Neo4j</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Executed during document chunk processing when entities are extracted:
            </p>
            <pre className="p-3.5 rounded-lg bg-surface-muted border border-border text-[11px] font-mono text-foreground leading-relaxed overflow-x-auto">
{`MERGE (s:Entity {name: $subject, workspace_id: $ws_id})
MERGE (o:Entity {name: $object, workspace_id: $ws_id})
MERGE (s)-[r:RELATION {type: $predicate}]->(o)
SET r.chunk_id = $chunk_id,
    r.confidence = $confidence,
    r.updated_at = datetime()
RETURN s, r, o;`}
            </pre>
          </div>

          <div className="p-5 rounded-xl border border-border bg-surface space-y-3">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-purple-600" />
              <h4 className="font-bold text-xs text-foreground">2. Retrieval: Multi-Hop Cypher Traversal</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Executed during query processing to discover relational context:
            </p>
            <pre className="p-3.5 rounded-lg bg-surface-muted border border-border text-[11px] font-mono text-foreground leading-relaxed overflow-x-auto">
{`MATCH (seed:Entity {workspace_id: $ws_id, name: $source})
MATCH (target:Entity {workspace_id: $ws_id, name: $target})
MATCH path = shortestPath((seed)-[r:RELATION*1..3]-(target))
RETURN path,
       length(path) AS hops,
       [rel IN relationships(path) | rel.type] AS relations;`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
