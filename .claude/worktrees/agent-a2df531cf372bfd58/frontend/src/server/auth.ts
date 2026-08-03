import { cookies } from "next/headers";
import { verifySessionToken, type SessionClaims } from "./jwt";

export const SESSION_COOKIE = "session";

function jwtSecret(): string {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) throw new Error("AUTH_JWT_SECRET is not set — copy .env.local.example to .env.local");
  return secret;
}

export type Session = {
  userId: string;
  role: SessionClaims["role"];
  restaurantId: string | null;
  organizationId: string | null;
};

/** Server-component/route-handler guard. Reads + verifies the session JWT locally. */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const claims = verifySessionToken(token, jwtSecret());
  if (!claims) return null;
  return {
    userId: claims.sub,
    role: claims.role,
    restaurantId: claims.restaurant_id,
    organizationId: claims.organization_id,
  };
}

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function isAdmin(): Promise<boolean> {
  return (await getSession()) !== null;
}
