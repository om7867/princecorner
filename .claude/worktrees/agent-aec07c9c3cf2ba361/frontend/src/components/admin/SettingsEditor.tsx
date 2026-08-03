"use client";

import { useEffect, useState } from "react";
import { PUBLIC_API_BASE_URL } from "@/lib/env";
import type { SiteSettingsDTO } from "@/lib/types";
import { SitePreviewPanel } from "./SitePreviewPanel";

const inputClasses =
  "mt-1 w-full rounded-xl border border-linen/15 bg-espresso/40 px-4 py-3 text-sm text-linen placeholder:text-linen/35 focus:border-saffron focus:outline-none";
const labelClasses = "block text-xs font-medium uppercase tracking-[0.15em] text-linen/60";

export function SettingsEditor() {
  const [form, setForm] = useState<SiteSettingsDTO | null>(null);
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    fetch(`${PUBLIC_API_BASE_URL}/settings`)
      .then((r) => r.json())
      .then((site: SiteSettingsDTO) => {
        setForm(site);
        setAnnouncementEnabled(site.announcement_enabled);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  function set<K extends keyof SiteSettingsDTO>(key: K, value: SiteSettingsDTO[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function save() {
    if (!form) return;
    setStatus("saving");
    await fetch("/api/admin/site", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, announcement_enabled: announcementEnabled }),
    }).catch(() => {});
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2000);
  }

  if (!loaded || !form) {
    return <div className="h-64 animate-pulse rounded-3xl bg-linen/5" aria-hidden />;
  }

  return (
    <main aria-label="Site and offers">
      <h1 className="font-display text-3xl italic text-linen">Site &amp; offers</h1>
      <p className="mt-1 max-w-2xl text-sm text-linen/50">
        Everything here is what guests see on the website and QR menu — change
        the restaurant&apos;s name, look, and offers in seconds.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="max-w-2xl">
      <div className="rounded-3xl border border-linen/10 bg-[#221913] p-6">
        <h2 className="font-display text-xl italic text-linen">Identity</h2>
        <p className="mt-1 text-xs text-linen/50">The name, tagline, and colors used across the site.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="s-name" className={labelClasses}>
              Restaurant name
            </label>
            <input
              id="s-name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="s-tagline" className={labelClasses}>
              Tagline
            </label>
            <input
              id="s-tagline"
              value={form.tagline ?? ""}
              onChange={(e) => set("tagline", e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="s-logo" className={labelClasses}>
              Logo URL
            </label>
            <input
              id="s-logo"
              value={form.logo_url ?? ""}
              onChange={(e) => set("logo_url", e.target.value)}
              placeholder="https://…"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="s-favicon" className={labelClasses}>
              Favicon URL
            </label>
            <input
              id="s-favicon"
              value={form.favicon_url ?? ""}
              onChange={(e) => set("favicon_url", e.target.value)}
              placeholder="https://…"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="s-primary" className={labelClasses}>
              Primary color
            </label>
            <input
              id="s-primary"
              type="color"
              value={form.primary_color ?? "#e7a73a"}
              onChange={(e) => set("primary_color", e.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-linen/15 bg-espresso/40"
            />
          </div>
          <div>
            <label htmlFor="s-accent" className={labelClasses}>
              Accent color
            </label>
            <input
              id="s-accent"
              type="color"
              value={form.accent_color ?? "#c1652f"}
              onChange={(e) => set("accent_color", e.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-linen/15 bg-espresso/40"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-linen/10 bg-[#221913] p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl italic text-linen">Offer banner</h2>
          <button
            onClick={() => setAnnouncementEnabled((v) => !v)}
            aria-pressed={announcementEnabled}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
              announcementEnabled ? "bg-sage/15 text-sage" : "bg-linen/10 text-linen/50"
            }`}
          >
            {announcementEnabled ? "Visible" : "Hidden"}
          </button>
        </div>

        <div className={announcementEnabled ? "mt-5 space-y-4" : "mt-5 space-y-4 opacity-40"}>
          <div>
            <label htmlFor="ann-text" className={labelClasses}>
              Banner text
            </label>
            <input
              id="ann-text"
              value={form.announcement_text ?? ""}
              onChange={(e) => set("announcement_text", e.target.value)}
              disabled={!announcementEnabled}
              placeholder="This weekend — 20% off family platters"
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
                value={form.announcement_label ?? ""}
                onChange={(e) => set("announcement_label", e.target.value)}
                disabled={!announcementEnabled}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="ann-href" className={labelClasses}>
                Link goes to
              </label>
              <input
                id="ann-href"
                value={form.announcement_href ?? ""}
                onChange={(e) => set("announcement_href", e.target.value)}
                disabled={!announcementEnabled}
                placeholder="/bar"
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        {announcementEnabled && form.announcement_text && (
          <div className="mt-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-linen/40">Preview</p>
            <div className="mt-1.5 rounded-xl bg-saffron px-4 py-2 text-center text-sm font-medium text-espresso">
              {form.announcement_text}{" "}
              <span className="font-semibold underline underline-offset-2">{form.announcement_label}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-3xl border border-linen/10 bg-[#221913] p-6">
        <h2 className="font-display text-xl italic text-linen">Contact</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="s-phone" className={labelClasses}>
              Phone
            </label>
            <input
              id="s-phone"
              value={form.phone ?? ""}
              onChange={(e) => set("phone", e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="s-email" className={labelClasses}>
              Email
            </label>
            <input
              id="s-email"
              value={form.email ?? ""}
              onChange={(e) => set("email", e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="s-whatsapp" className={labelClasses}>
              WhatsApp number
            </label>
            <input
              id="s-whatsapp"
              value={form.whatsapp ?? ""}
              onChange={(e) => set("whatsapp", e.target.value)}
              placeholder="Digits only, with country code"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="s-city" className={labelClasses}>
              City
            </label>
            <input
              id="s-city"
              value={form.address_city ?? ""}
              onChange={(e) => set("address_city", e.target.value)}
              className={inputClasses}
            />
          </div>
        </div>
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
      </div>

      <div className="hidden lg:block">
        <SitePreviewPanel form={form} announcementEnabled={announcementEnabled} />
      </div>
      </div>
    </main>
  );
}
