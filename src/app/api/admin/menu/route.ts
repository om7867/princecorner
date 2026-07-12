import { NextResponse } from "next/server";
import { isAdmin } from "@/server/auth";
import { getMenu, updateMenuItem } from "@/server/store";

export const dynamic = "force-dynamic";

/** Admin: full menu including 86'd items. */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ items: await getMenu() });
}

/** Admin: edit an item — name, description, price, availability. */
export async function PATCH(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    id?: string;
    name?: string;
    description?: string;
    price?: string;
    available?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  if (!body.id) {
    return NextResponse.json({ ok: false, error: "Missing item id." }, { status: 400 });
  }

  const patch: Record<string, string | boolean> = {};
  if (typeof body.name === "string" && body.name.trim()) patch.name = body.name.trim();
  if (typeof body.description === "string") patch.description = body.description.trim();
  if (typeof body.price === "string" && body.price.trim()) patch.price = body.price.trim();
  if (typeof body.available === "boolean") patch.available = body.available;

  const item = await updateMenuItem(body.id, patch);
  if (!item) {
    return NextResponse.json({ ok: false, error: "Item not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, item });
}
