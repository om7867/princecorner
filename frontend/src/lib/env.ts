/** Server-side only — used inside Next.js route handlers (the BFF proxy layer). */
export const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8000";

/** Client-side — direct public calls (guest menu/order/reservation) + WebSockets. */
export const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
export const PUBLIC_WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL ?? "ws://localhost:8000";

/** The public-facing domain this site is deployed at — used for canonical
 * URLs, sitemaps, and structured data. Not restaurant content, so it lives
 * in an env var rather than admin-editable Settings. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
