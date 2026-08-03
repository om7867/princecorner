import type { SiteSettingsDTO } from "@/lib/types";

/** Live mock of the public site's top-of-page, reflecting unsaved form
 * state — so an admin can see the effect of a change before publishing it. */
export function SitePreviewPanel({
  form,
  announcementEnabled,
}: {
  form: SiteSettingsDTO;
  announcementEnabled: boolean;
}) {
  const primary = form.primary_color || "#e7a73a";
  const accent = form.accent_color || "#c1622c";

  return (
    <div className="sticky top-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-linen/40">
        Live preview
      </p>
      <div className="mt-2 overflow-hidden rounded-3xl border border-linen/10 shadow-2xl shadow-black/40">
        {/* browser chrome */}
        <div className="flex items-center gap-1.5 bg-[#1c1512] px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-linen/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-linen/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-linen/15" />
          <span className="ml-3 truncate rounded-full bg-linen/5 px-3 py-0.5 text-[10px] text-linen/40">
            yoursite.com
          </span>
        </div>

        {announcementEnabled && form.announcement_text && (
          <div
            className="px-4 py-2 text-center text-[11px] font-medium text-espresso"
            style={{ backgroundColor: primary }}
          >
            {form.announcement_text}{" "}
            {form.announcement_label && (
              <span className="font-semibold underline underline-offset-2">
                {form.announcement_label}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between bg-espresso px-4 py-3">
          <span className="font-display text-sm italic text-linen">
            {form.name || "Your Restaurant"}
            <span style={{ color: primary }}>.</span>
          </span>
          <span
            className="rounded-full px-3 py-1 text-[10px] font-semibold text-espresso"
            style={{ backgroundColor: accent }}
          >
            Reserve
          </span>
        </div>

        <div className="relative bg-gradient-to-b from-[#3d2a1a] via-[#2e1e12] to-[#221b15] px-6 py-10 text-center">
          <div
            aria-hidden
            className="absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(ellipse at 50% 60%, ${primary}, transparent 65%)`,
            }}
          />
          <div className="relative">
            <p
              className="text-[9px] font-semibold uppercase tracking-[0.3em]"
              style={{ color: primary }}
            >
              {form.tagline || "Restaurant · Café · Bar · Bakery"}
            </p>
            <h2 className="mt-3 font-display text-2xl italic text-linen">
              Welcome to <span style={{ color: primary }}>{form.name || "Your Restaurant"}</span>
            </h2>
            <p className="mx-auto mt-3 max-w-[220px] text-[11px] text-linen/70">
              {form.description ||
                "Slow-roasted, hand-poured, and served at our table."}
            </p>
            <div className="mt-5 flex items-center justify-center gap-2">
              <span
                className="rounded-full px-4 py-1.5 text-[11px] font-semibold text-espresso"
                style={{ backgroundColor: primary }}
              >
                Reserve a Table
              </span>
              <span className="rounded-full border border-linen/30 px-4 py-1.5 text-[11px] font-semibold text-linen">
                Explore Menu
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 bg-[#181210] px-4 py-3 text-[10px] text-linen/50">
          <span className="truncate">{form.phone || "+1 (000) 000-0000"}</span>
          <span className="truncate">{form.email || "hello@example.com"}</span>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-linen/35">
        Updates as you type — nothing here is live until you hit &quot;Publish changes&quot;.
      </p>
    </div>
  );
}
