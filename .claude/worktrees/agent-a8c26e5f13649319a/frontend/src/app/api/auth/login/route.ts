import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE_URL } from "@/lib/env";
import { SESSION_COOKIE } from "@/server/auth";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: body.email ?? "", password: body.password ?? "" }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return NextResponse.json(
      { ok: false, error: data?.detail ?? "Wrong email or password." },
      { status: res.status }
    );
  }

  const { access_token, role, name } = await res.json();

  const store = await cookies();
  store.set(SESSION_COOKIE, access_token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // matches backend JWT_EXPIRE_MINUTES default (8h)
  });

  return NextResponse.json({ ok: true, role, name });
}
