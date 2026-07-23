import { cookies } from "next/headers";
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

  // A super_admin session may have picked a branch to operate on (see
  // /api/admin/select-branch); forward it as a raw cookie so the backend's
  // staff tenant-resolver can pin every /admin/* call to that branch.
  // Branch-level roles ignore this cookie entirely on the backend.
  const selectedBranchId = (await cookies()).get("selected_branch_id")?.value;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(selectedBranchId ? { Cookie: `selected_branch_id=${selectedBranchId}` } : {}),
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
