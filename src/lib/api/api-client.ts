/**
 * Base API client.
 * - Reads VITE_API_BASE_URL — MUST be set in Vercel environment variables
 * - Falls back to the production Render URL if env var is missing
 * - Injects Authorization: Bearer <token> from Zustand persisted localStorage
 * - 30s timeout to handle Render free tier cold starts
 */

// Hardcoded production fallback — ensures the app works even if Vercel env var is missing
const PRODUCTION_API = "https://grantbridge-backend-2.onrender.com/api/v1";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || PRODUCTION_API;

/** Read the JWT access token from Zustand's persisted localStorage entry. */
function getAccessToken(): string | null {
  try {
    const raw = localStorage.getItem("grantbridge-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      state?: { accessToken?: string | null };
    };
    return parsed?.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

/** Clear auth state and redirect to login on 401. */
function handleUnauthorized() {
  try {
    localStorage.removeItem("grantbridge-auth");
  } catch {
    // ignore
  }
  const path = window.location.pathname;
  const role = path.includes("funder") ? "funder" : "entrepreneur";
  window.location.href = `/login/${role}`;
}

export async function fetchApi<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const token = getAccessToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Don't set Content-Type for FormData — browser sets it with boundary
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // 30 second timeout — handles Render free tier cold starts
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 401) {
      handleUnauthorized();
      throw new Error("Session expired. Please log in again.");
    }

    const text = await response.text();

    // Check if response is HTML (server error page) instead of JSON
    if (text.trim().startsWith("<!") || text.trim().startsWith("<html")) {
      if (response.status >= 500) {
        throw new Error("Server is temporarily unavailable. Please try again in a moment.");
      }
      throw new Error("Unexpected server response. Please try again.");
    }

    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const message =
        data?.error || data?.message || data?.detail || response.statusText;
      throw new Error(message);
    }

    return data as T;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(
        "Server is waking up — please wait a moment and try again.",
      );
    }
    throw err;
  }
}

export const API_BASE = API_BASE_URL;
