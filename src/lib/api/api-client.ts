/**
 * Base API client.
 * - Reads VITE_API_BASE_URL (defaults to /api/v1)
 * - Injects Authorization: Bearer <token> from Zustand persisted localStorage
 * - Handles 401 by clearing auth state and redirecting to login
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

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

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Session expired. Please log in again.");
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      data?.error || data?.message || data?.detail || response.statusText;
    throw new Error(message);
  }

  return data as T;
}

export const API_BASE = API_BASE_URL;
