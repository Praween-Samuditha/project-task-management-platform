"use client";

// lib/newApi.ts — fetch wrapper for the new backend (port 4000)
// Attaches Bearer token, retries once on 401 via /auth/refresh

const BASE = "http://localhost:4000/api";

const STORAGE_ACCESS  = "np_access";
const STORAGE_REFRESH = "np_refresh";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_ACCESS);
}
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_REFRESH);
}
export function saveTokens(access: string, refresh: string) {
  localStorage.setItem(STORAGE_ACCESS, access);
  localStorage.setItem(STORAGE_REFRESH, refresh);
}
export function clearTokens() {
  localStorage.removeItem(STORAGE_ACCESS);
  localStorage.removeItem(STORAGE_REFRESH);
  localStorage.removeItem("np_user");
}
export function saveUser(user: object) {
  localStorage.setItem("np_user", JSON.stringify(user));
}
export function loadUser<T>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("np_user");
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const rt = getRefreshToken();
  if (!rt) return null;
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) { clearTokens(); return null; }
    const data = await res.json();
    saveTokens(data.accessToken, data.refreshToken ?? rt);
    return data.accessToken as string;
  } catch {
    clearTokens();
    return null;
  }
}

export async function newApiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401 && retry) {
    // Try refresh once
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = doRefresh().finally(() => { isRefreshing = false; });
    }
    const newToken = await refreshPromise;
    if (!newToken) {
      if (typeof window !== "undefined") window.location.href = "/v2/login";
      throw new Error("Session expired");
    }
    return newApiFetch<T>(path, options, false);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw Object.assign(new Error(err.error ?? "Request failed"), { status: res.status, data: err });
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
