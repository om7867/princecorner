import { NextResponse } from "next/server";
import { isAdmin } from "@/server/auth";
import { updateSiteSettings, type SiteSettings } from "@/server/store";

export const dynamic = "force-dynamic";

/** Admin: edit live site settings (announcement bar, demo branding line). */
export async function PATCH(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: Partial<SiteSettings>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const patch: Partial<SiteSettings> = {};
  if ("announcement" in body) {
    if (body.announcement === null) {
      patch.announcement = null;
    } else if (
      body.announcement &&
      typeof body.announcement.text === "string" &&
      typeof body.announcement.href === "string" &&
      typeof body.announcement.label === "string"
    ) {
      patch.announcement = {
        text: body.announcement.text.trim(),
        href: body.announcement.href.trim() || "/",
        label: body.announcement.label.trim() || "See more",
      };
    }
  }
  if (typeof body.presents === "string") patch.presents = body.presents.trim();

  const site = await updateSiteSettings(patch);
  return NextResponse.json({ ok: true, site });
}
