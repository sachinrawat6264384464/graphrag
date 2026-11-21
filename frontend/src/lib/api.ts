/**
 * Typed API Client for NexusAI Backend API
 */

export interface ServiceComponentStatus {
  status: "healthy" | "unhealthy" | "disabled" | "unknown";
  latency_ms: number | null;
  details: string | null;
}

export interface ReadinessResponse {
  status: "healthy" | "degraded" | "unhealthy";
  app_name: string;
  version: string;
  environment: string;
  timestamp: string;
  services: {
    postgres: ServiceComponentStatus;
    neo4j: ServiceComponentStatus;
    redis: ServiceComponentStatus;
  };
}

export interface HealthResponse {
  status: "alive" | "healthy" | "degraded" | "unhealthy";
  app_name: string;
  version: string;
  environment: string;
  timestamp: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Fetch application liveness
 */
export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/health/live`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch health: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Fetch detailed readiness across backing databases.
 * Returns null gracefully if backend is offline.
 */
export async function fetchReadiness(): Promise<ReadinessResponse | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(`${API_BASE_URL}/api/v1/health/ready`, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok && res.status !== 503) {
      return null;
    }
    return await res.json();
  } catch {
    return null;
  }
}

