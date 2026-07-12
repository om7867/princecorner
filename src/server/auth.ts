import { cookies } from "next/headers";

export const ADMIN_COOKIE = "smaplee_admin";

/** Demo credentials — surfaced by the "Fill demo credentials" button. */
export const DEMO_ADMIN = {
  email: "admin@kelviontech.demo",
  password: "kelvion123",
};

export function checkCredentials(email: string, password: string): boolean {
  return email === DEMO_ADMIN.email && password === DEMO_ADMIN.password;
}

/** Server-component/route-handler guard. */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === "ok";
}
