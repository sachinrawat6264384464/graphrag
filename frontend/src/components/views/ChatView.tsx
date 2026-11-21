"use client";

import { useState } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  Layers,
  Share2,
  FileText,
  Clock,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface Citation {
  documentTitle: string;
  filename: string;
  chunkIndex: number;
  snippet: string;
  score: number;
}

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  mode?: "hybrid" | "dense" | "graph";
  latencyMs?: number;
  confidence?: number;
  citations?: Citation[];
}

export function ChatView({ documentCount }: { documentCount: number }) {
  const [retrievalMode, setRetrievalMode] = useState<"hybrid" | "dense" | "graph">("hybrid");
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      sender: "assistant",
      text: "Welcome to NexusAI Intelligence Chat! Ask questions grounded in your ingested documents. I perform hybrid retrieval combining pgvector dense semantic embeddings with BM25 keyword matching and Neo4j property graphs.",
      timestamp: "Just now",
      citations: [],
    },
  ]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || loading) return;

    const userText = inputQuery.trim();
    setInputQuery("");
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Simulate RAG generation grounded response
    setTimeout(() => {
      const isArchitectureQuery =
        userText.toLowerCase().includes("nexus") ||
        userText.toLowerCase().includes("architecture") ||
        userText.toLowerCase().includes("rag") ||
        userText.toLowerCase().includes("tenant");

      const responseText = isArchitectureQuery
        ? "NexusAI implements an Enterprise Hybrid RAG architecture. Document ingestion recursively chunks text into 1,000 token passages with 150-token overlap. Queries are dispatched simultaneously across PostgreSQL pgvector (dense semantic search) and keyword indexes, then combined using Reciprocal Rank Fusion (RRF). Cross-tenant boundaries are strictly enforced via workspace isolation."
        : `Answer synthesized based on ${documentCount > 0 ? documentCount : "system"} indexed documents in your workspace. Hybrid fusion balanced semantic context and keyword relevance to formulate this evidence-backed response.`;

      const mockCitations: Citation[] = [
        {
          documentTitle: "NexusAI Architecture Whitepaper",
          filename: "nexusai_architecture.md",
          chunkIndex: 0,
          snippet:
            "NexusAI unifies dense semantic search, exact keyword matching, and property graph traversal to deliver zero-hallucination RAG intelligence.",
          score: 0.94,
        },
        {
          documentTitle: "Multi-Tenant Security Specification",
          filename: "security_spec.pdf",
          chunkIndex: 2,
          snippet:
            "Every workspace represents an isolated data boundary. Documents and chunks belong exclusively to their provisioned tenant with strict RBAC enforcement.",
          score: 0.88,
        },
      ];

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        mode: retrievalMode,
        latencyMs: 342,
        confidence: 96,
        citations: mockCitations,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setLoading(false);
    }, 900);
  };

  const handlePromptClick = (prompt: string) => {
    setInputQuery(prompt);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
      {/* Header with Retrieval Mode Toggles */}
      <div className="px-5 py-3.5 border-b border-border bg-surface-muted/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-accent/10 text-accent">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground">AI Intelligence Search & Chat</h3>
            <p className="text-[11px] text-muted-foreground">Evidence-grounded RAG with source verification</p>
          </div>
        </div>

        {/* Retrieval Mode Badges */}
        <div className="inline-flex items-center p-1 rounded-lg border border-border bg-surface text-xs font-medium">
          <button
            onClick={() => setRetrievalMode("hybrid")}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              retrievalMode === "hybrid"
                ? "bg-accent text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3 w-3" />
            <span>Hybrid (Dense + RRF)</span>
          </button>
          <button
            onClick={() => setRetrievalMode("dense")}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              retrievalMode === "dense"
                ? "bg-accent text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="h-3 w-3" />
            <span>Dense pgvector</span>
          </button>
          <button
            onClick={() => setRetrievalMode("graph")}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              retrievalMode === "graph"
                ? "bg-accent text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Share2 className="h-3 w-3" />
            <span>GraphRAG (Neo4j)</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.sender === "user"
                  ? "bg-accent text-white"
                  : "bg-surface-muted border border-border text-accent"
              }`}
            >
              {msg.sender === "user" ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            <div className="space-y-2 max-w-[85%]">
              <div
                className={`p-4 rounded-xl text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-accent text-white rounded-tr-none"
                    : "bg-surface-muted/60 border border-border text-foreground rounded-tl-none space-y-3"
                }`}
              >
                <p>{msg.text}</p>

                {/* Grounding metadata for assistant responses */}
                {msg.sender === "assistant" && msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2 border-t border-border/60 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        Grounded Evidence ({msg.citations.length} sources)
                      </span>
                      {msg.latencyMs && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {msg.latencyMs}ms • {msg.confidence}% confidence
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.citations.map((cite, i) => (
                        <div
                          key={i}
                          onClick={() => setActiveCitation(cite)}
                          className="p-2.5 rounded-lg border border-border bg-surface hover:border-accent/40 transition-colors cursor-pointer space-y-1 text-left"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-accent truncate max-w-[140px]">
                              {cite.documentTitle}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              Chunk #{cite.chunkIndex + 1}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 italic">
                            "{cite.snippet}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div
                className={`text-[10px] text-muted-foreground ${
                  msg.sender === "user" ? "text-right" : "text-left"
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 max-w-md">
            <div className="h-7 w-7 rounded-full bg-surface-muted border border-border text-accent flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 animate-spin" />
            </div>
            <div className="p-3.5 rounded-xl rounded-tl-none bg-surface-muted/60 border border-border text-xs text-muted-foreground flex items-center gap-2">
              <span className="animate-pulse">Retrieving evidence chunks & synthesizing answer...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompts */}
      <div className="px-5 py-2 border-t border-border/60 bg-surface-muted/20 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
        <span className="text-[11px] text-muted-foreground font-medium shrink-0">Try asking:</span>
        {[
          "Explain the NexusAI hybrid fusion architecture",
          "How does multi-tenant isolation work?",
          "Summarize document chunking strategy",
        ].map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handlePromptClick(prompt)}
            className="px-2.5 py-1 rounded-full border border-border bg-surface hover:bg-surface-muted text-muted-foreground hover:text-foreground text-[11px] shrink-0 transition-colors cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-border bg-surface flex items-center gap-2 shrink-0">
        <input
          type="text"
          placeholder="Ask a question grounded in your documents..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          disabled={loading}
          className="flex-1 rounded-lg border border-border bg-surface-muted px-4 py-2 text-xs focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-accent text-white hover:bg-accent/90 transition-all cursor-pointer disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          <span>Ask AI</span>
        </button>
      </form>

      {/* Citation Inspector Drawer */}
      {activeCitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-accent" />
                <h3 className="font-bold text-sm">{activeCitation.documentTitle}</h3>
              </div>
              <button
                onClick={() => setActiveCitation(null)}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                <span>Source File: {activeCitation.filename}</span>
                <span>Relevance Score: {(activeCitation.score * 100).toFixed(0)}%</span>
              </div>
              <div className="p-3.5 rounded-lg border border-border bg-surface-muted font-mono leading-relaxed text-xs">
                {activeCitation.snippet}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setActiveCitation(null)}
                className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-surface-muted border border-border hover:bg-surface cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
