"use client";

import { useState } from "react";
import { loginApi, registerApi, AuthResponse } from "@/lib/api";
import { X, Lock, Mail, User as UserIcon, AlertCircle, ArrowRight } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: { token: string; email: string }) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const res = await loginApi(email, password);
        onSuccess({ token: res.access_token, email });
      } else {
        const res = await registerApi(email, password, fullName);
        onSuccess({ token: res.token.access_token, email });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl space-y-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">
            {isLogin ? "Sign In to NexusAI" : "Create NexusAI Account"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isLogin
              ? "Access your isolated workspaces, indexed documents, and graph intelligence."
              : "Provision a personal multi-tenant workspace and start indexing documents."}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-status-error/10 border border-status-error/20 text-status-error text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  placeholder="Sachin Rawat"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface-muted py-2 pl-9 pr-3 text-xs focus:border-accent focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                placeholder="sachin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-border bg-surface-muted py-2 pl-9 pr-3 text-xs focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                required
                minLength={8}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-border bg-surface-muted py-2 pl-9 pr-3 text-xs focus:border-accent focus:outline-none"
              />
            </div>
            {!isLogin && (
              <span className="text-[10px] text-muted-foreground">Minimum 8 characters.</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-md bg-accent py-2.5 text-xs font-semibold text-white hover:bg-accent-hover transition-colors disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Register Account"}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>

        <div className="text-center text-xs text-muted-foreground pt-2 border-t border-border">
          {isLogin ? (
            <span>
              Don't have an account?{" "}
              <button
                onClick={() => {
                  setIsLogin(false);
                  setError(null);
                }}
                className="font-medium text-accent hover:underline cursor-pointer"
              >
                Create one now
              </button>
            </span>
          ) : (
            <span>
              Already registered?{" "}
              <button
                onClick={() => {
                  setIsLogin(true);
                  setError(null);
                }}
                className="font-medium text-accent hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
