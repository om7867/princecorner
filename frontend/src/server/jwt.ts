import { createHmac, timingSafeEqual } from "crypto";

export type SessionClaims = {
  sub: string;
  role: "owner" | "admin" | "manager" | "cashier" | "kitchen" | "waiter";
  restaurant_id: string;
  exp: number;
};

function base64UrlDecode(input: string): Buffer {
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

/**
 * Minimal HS256 JWT verifier. The frontend and backend share JWT_SECRET, so
 * the session cookie can be verified locally (no network round-trip to
 * /auth/me on every admin page load).
 */
export function verifySessionToken(token: string, secret: string): SessionClaims | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, signatureB64] = parts;

  const expected = createHmac("sha256", secret).update(`${headerB64}.${payloadB64}`).digest();
  const actual = base64UrlDecode(signatureB64);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(payloadB64).toString("utf-8")) as SessionClaims;
    if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
