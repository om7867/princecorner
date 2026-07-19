import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/env";
import { getSessionToken } from "./auth";

/**
 * Forwards an authenticated request to the FastAPI backend with the
 * session JWT as a Bearer token, and pipes the JSON response straight back.
 * Every admin route handler is a thin wrapper around this — the browser
 * never needs `credentials: "include"` or to know the backend's origin.
 */
export async function proxyToBackend(
  path: string,
  init?: { method?: string; body?: unknown }
): Promise<NextResponse> {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = (data && (data.detail || data.error)) || "Request failed";
    return NextResponse.json({ ok: false, error: message }, { status: res.status });
  }
  return NextResponse.json(data);
}
