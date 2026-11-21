"use client";

import { useEffect, useState, useCallback } from "react";
import {
  fetchReadiness,
  fetchDocumentsApi,
  fetchProfileApi,
  loginApi,
  registerApi,
  ReadinessResponse,
  DocumentItem,
  User,
  Workspace,
} from "@/lib/api";
import { AuthModal } from "@/components/auth/AuthModal";
import { OverviewView } from "@/components/views/OverviewView";
import { DocumentsView } from "@/components/views/DocumentsView";
import { ChatView } from "@/components/views/ChatView";
import { GraphView } from "@/components/views/GraphView";
import { InspectorView } from "@/components/views/InspectorView";
import { ArchitectureLabView } from "@/components/views/ArchitectureLabView";
import {
  Activity,
  FileText,
  MessageSquare,
  Share2,
  Layers,
  ShieldCheck,
  RefreshCw,
  LogIn,
  LogOut,
  Sparkles,
  Menu,
  X,
  Upload,
  Zap,
} from "lucide-react";

type NavigationTab = "lab" | "documents" | "chat" | "graph" | "inspector" | "overview";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<NavigationTab>("lab");
  const [readiness, setReadiness] = useState<ReadinessResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Authentication & Workspace State
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Documents State
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loadingDocs, setLoadingDocs] = useState<boolean>(false);

  // Mobile sidebar state
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Health check callback
  const checkStatus = useCallback(async () => {
    setLoadingHealth(true);
    try {
      const data = await fetchReadiness();
      setReadiness(data);
      setLastUpdated(new Date());
    } finally {
      setLoadingHealth(false);
    }
  }, []);

  // Fetch documents callback
  const loadDocuments = useCallback(async (wsId: string, authToken: string) => {
    setLoadingDocs(true);
    try {
      const docs = await fetchDocumentsApi(wsId, authToken);
      setDocuments(docs);
    } catch {
      // In case of error, keep previous
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  // Check saved token or initialize session
  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 8000);

    const savedToken = localStorage.getItem("nexus_token");
    if (savedToken) {
      setToken(savedToken);
      fetchProfileApi(savedToken)
        .then((profile) => {
          setUser(profile.user);
          setWorkspaces(profile.workspaces);
          if (profile.workspaces.length > 0) {
            setActiveWorkspace(profile.workspaces[0]);
            loadDocuments(profile.workspaces[0].id, savedToken);
          }
        })
        .catch(() => {
          localStorage.removeItem("nexus_token");
          setToken(null);
        });
    }

    return () => clearInterval(interval);
  }, [checkStatus, loadDocuments]);

  // Handle successful login/registration
  const handleAuthSuccess = async (data: { token: string; email: string }) => {
    localStorage.setItem("nexus_token", data.token);
    setToken(data.token);
    try {
      const profile = await fetchProfileApi(data.token);
      setUser(profile.user);
      setWorkspaces(profile.workspaces);
      if (profile.workspaces.length > 0) {
        setActiveWorkspace(profile.workspaces[0]);
        loadDocuments(profile.workspaces[0].id, data.token);
      }
    } catch {
      // ignore
    }
  };

  // Quick 1-click guest login for frictionless developer experience
  const handleQuickDemoLogin = async () => {
    try {
      const demoEmail = "sachin_demo@example.com";
      const demoPassword = "Password123!";
      try {
        const res = await loginApi(demoEmail, demoPassword);
        handleAuthSuccess({ token: res.access_token, email: demoEmail });
      } catch {
        const reg = await registerApi(demoEmail, demoPassword, "Sachin Rawat");
        handleAuthSuccess({ token: reg.token.access_token, email: demoEmail });
      }
    } catch {
      setIsAuthModalOpen(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("nexus_token");
    setToken(null);
    setUser(null);
    setWorkspaces([]);
    setActiveWorkspace(null);
    setDocuments([]);
  };

  const totalChunksCount = documents.reduce((acc, d) => acc + (d.total_chunks || 0), 0);

  const navItems = [
    {
      id: "lab" as NavigationTab,
      label: "Architecture Lab (How It Works)",
      icon: Zap,
      badge: "Interactive",
      badgeColor: "text-amber-500 bg-amber-500/10 font-bold",
    },
    {
      id: "documents" as NavigationTab,
      label: "Document Ingestion",
      icon: FileText,
      badge: `${documents.length}`,
      badgeColor: "text-accent bg-accent/10",
    },
    {
      id: "chat" as NavigationTab,
      label: "AI Search & Chat (RAG)",
      icon: MessageSquare,
      badge: "Active",
      badgeColor: "text-accent bg-accent/10",
    },
    {
      id: "graph" as NavigationTab,
      label: "Knowledge Graph (Neo4j)",
      icon: Share2,
      badge: "Triples",
      badgeColor: "text-purple-500 bg-purple-500/10",
    },
    {
      id: "inspector" as NavigationTab,
      label: "Retrieval Inspector",
      icon: Layers,
      badge: "7 Stages",
      badgeColor: "text-muted-foreground bg-surface-muted",
    },
    {
      id: "overview" as NavigationTab,
      label: "System Health & Roadmap",
      icon: Activity,
      badge: readiness?.status ? readiness.status.toUpperCase() : null,
      badgeColor:
        readiness?.status === "healthy"
          ? "text-green-500 bg-green-500/10"
          : "text-yellow-500 bg-yellow-500/10",
    },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Left Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-surface flex flex-col transition-transform lg:static lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-accent text-white flex items-center justify-center font-bold text-base shadow-sm">
              NX
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight leading-tight">NexusAI</h1>
              <p className="text-[11px] text-muted-foreground">Hybrid RAG + GraphRAG</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Workspace Selector Card */}
        <div className="p-4 border-b border-border bg-surface-muted/30">
          <div className="p-3 rounded-lg border border-border bg-surface space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                Active Tenant
              </span>
              <span className="text-[10px] text-green-500 font-semibold flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Isolated
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground truncate max-w-[150px]">
                {activeWorkspace ? activeWorkspace.name : "Personal Workspace"}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground truncate">
              ID: {activeWorkspace ? activeWorkspace.id.slice(0, 13) + "..." : "Auto-Provisioned"}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-accent text-white shadow-xs"
                    : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      isActive ? "bg-white/20 text-white" : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Account / Profile Section */}
        <div className="p-4 border-t border-border bg-surface-muted/30 space-y-2">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="h-8 w-8 rounded-full bg-accent/15 text-accent flex items-center justify-center font-bold text-xs shrink-0">
                  {user.email[0].toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {user.full_name || user.email.split("@")[0]}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 rounded-md hover:bg-surface-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-accent text-white hover:bg-accent/90 transition-all cursor-pointer shadow-xs"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In / Register</span>
              </button>
              <button
                onClick={handleQuickDemoLogin}
                className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground border border-border bg-surface hover:bg-surface-muted transition-colors cursor-pointer"
              >
                <Sparkles className="h-3 w-3 text-accent" />
                <span>1-Click Test Login (Sachin)</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-border bg-surface px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-sm font-bold capitalize text-foreground">
                {activeTab === "lab" && "Live Architecture Lab (How Hybrid & GraphRAG Work)"}
                {activeTab === "documents" && "Document Ingestion & Chunking (Phase 2)"}
                {activeTab === "chat" && "AI Search & Evidence Grounded Chat"}
                {activeTab === "graph" && "Knowledge Graph Explorer (Neo4j)"}
                {activeTab === "inspector" && "Retrieval Pipeline Inspector"}
                {activeTab === "overview" && "System Health & Roadmap"}
              </h2>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                NexusAI Multi-Tenant Knowledge Intelligence Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Upload action in header */}
            {activeTab !== "documents" && (
              <button
                onClick={() => setActiveTab("documents")}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-surface hover:bg-surface-muted transition-colors cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5 text-accent" />
                <span>Upload Document</span>
              </button>
            )}

            {/* Health pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-border bg-surface-muted">
              <span
                className={`h-2 w-2 rounded-full ${
                  readiness?.status === "healthy"
                    ? "bg-green-500"
                    : readiness?.status === "degraded"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              />
              <span className="font-semibold text-[11px]">
                {readiness?.status ? readiness.status.toUpperCase() : "CHECKING..."}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Body Content */}
        <main className="flex-1 overflow-y-auto p-6 max-w-6xl w-full mx-auto">
          {activeTab === "lab" && <ArchitectureLabView />}

          {activeTab === "overview" && (
            <OverviewView
              readiness={readiness}
              loading={loadingHealth}
              lastUpdated={lastUpdated}
              onRefresh={checkStatus}
              onNavigateTab={(tab) => setActiveTab(tab as NavigationTab)}
              documentCount={documents.length}
              chunkCount={totalChunksCount}
              userEmail={user?.email || null}
            />
          )}

          {activeTab === "documents" && (
            <DocumentsView
              documents={documents}
              workspaceId={activeWorkspace?.id || null}
              token={token}
              onRefresh={() => {
                if (activeWorkspace && token) loadDocuments(activeWorkspace.id, token);
              }}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          )}

          {activeTab === "chat" && <ChatView documentCount={documents.length} />}

          {activeTab === "graph" && <GraphView />}

          {activeTab === "inspector" && <InspectorView />}
        </main>
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
