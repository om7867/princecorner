"use client";

import { useEffect, useState } from "react";

type SiteSettings = {
  announcement: { text: string; href: string; label: string } | null;
  presents: string;
};

const inputClasses =
  "mt-1 w-full rounded-xl border border-linen/15 bg-espresso/40 px-4 py-3 text-sm text-linen placeholder:text-linen/35 focus:border-saffron focus:outline-none";
const labelClasses =
  "block text-xs font-medium uppercase tracking-[0.15em] text-linen/60";

export function SettingsEditor() {
  const [enabled, setEnabled] = useState(true);
  const [text, setText] = useState("");
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");
  const [presents, setPresents] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    fetch("/api/site")
      .then((r) => r.json())
      .then((site: SiteSettings) => {
        setEnabled(!!site.announcement);
        setText(site.announcement?.text ?? "");
        setLabel(site.announcement?.label ?? "See more");
        setHref(site.announcement?.href ?? "/");
        setPresents(site.presents ?? "");
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  async function save() {
    setStatus("saving");
    await fetch("/api/admin/site", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        presents,
        announcement: enabled ? { text, label, href } : null,
      }),
    }).catch(() => {});
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2000);
  }

  if (!loaded) {
    return <div className="h-64 animate-pulse rounded-3xl bg-linen/5" aria-hidden />;
  }

  return (
    <main aria-label="Site and offers" className="max-w-2xl">
      <h1 className="font-display text-3xl italic text-linen">Site &amp; offers</h1>
      <p className="mt-1 text-sm text-linen/50">
        The offer banner shows at the top of every page of the website. Post a
        special in seconds — visitors see it on their next page view.
      </p>

      <div className="mt-8 rounded-3xl border border-linen/10 bg-[#221913] p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl italic text-linen">Offer banner</h2>
          <button
            onClick={() => setEnabled((v) => !v)}
            aria-pressed={enabled}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
              enabled ? "bg-sage/15 text-sage" : "bg-linen/10 text-linen/50"
            }`}
          >
            {enabled ? "Visible" : "Hidden"}
          </button>
        </div>

        <div className={enabled ? "mt-5 space-y-4" : "mt-5 space-y-4 opacity-40"}>
          <div>
            <label htmlFor="ann-text" className={labelClasses}>
              Banner text
            </label>
            <input
              id="ann-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={!enabled}
              placeholder="Diwali special — 20% off family platters this weekend"
              className={inputClasses}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ann-label" className={labelClasses}>
                Link label
              </label>
              <input
                id="ann-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                disabled={!enabled}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="ann-href" className={labelClasses}>
                Link goes to
              </label>
              <input
                id="ann-href"
                value={href}
                onChange={(e) => setHref(e.target.value)}
                disabled={!enabled}
                placeholder="/venue/bar"
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        {/* live preview */}
        {enabled && text && (
          <div className="mt-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-linen/40">Preview</p>
            <div className="mt-1.5 rounded-xl bg-saffron px-4 py-2 text-center text-sm font-medium text-espresso">
              {text}{" "}
              <span className="font-semibold underline underline-offset-2">{label}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-3xl border border-linen/10 bg-[#221913] p-6">
        <h2 className="font-display text-xl italic text-linen">Demo branding</h2>
        <p className="mt-1 text-xs text-linen/50">
          The small line above the logo — e.g. “KelvionTech presents”.
        </p>
        <input
          aria-label="Branding line"
          value={presents}
          onChange={(e) => setPresents(e.target.value)}
          className={`${inputClasses} mt-3`}
        />
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={save}
          disabled={status === "saving"}
          className="rounded-full bg-saffron px-8 py-3 font-body text-sm font-semibold text-espresso transition-transform hover:scale-[1.02] disabled:cursor-wait disabled:opacity-60"
        >
          {status === "saving" ? "Publishing…" : "Publish changes"}
        </button>
        <span aria-live="polite" className="text-sm text-sage">
          {status === "saved" ? "✓ Live on the website" : ""}
        </span>
      </div>
    </main>
  );
}
