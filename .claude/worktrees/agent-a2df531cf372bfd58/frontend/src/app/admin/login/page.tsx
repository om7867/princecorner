"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const DEMO_CARDS = [
  {
    role: "Platform Owner",
    tagline: "Runs the SaaS itself",
    detail: "Create & suspend restaurant chains across the whole platform.",
    email: "platform@example.com",
    password: "ChangeMe123!",
  },
  {
    role: "Super Admin",
    tagline: "Owns a restaurant chain",
    detail: "Switch between branches, see chain-wide analytics.",
    email: "demo.superadmin@example.com",
    password: "DemoPass123!",
  },
  {
    role: "Branch Admin",
    tagline: "Runs one location",
    detail: "Menu, live orders, payments, inventory — one branch.",
    email: "demo.branchadmin@example.com",
    password: "DemoPass123!",
  },
  {
    role: "Prince Corner",
    tagline: "A real restaurant, live",
    detail: "The full flow — QR order to kitchen screen to dashboard.",
    email: "owner@princecorner.example.com",
    password: "PrinceCorner@123",
  },
] as const;

export default function AdminLoginPage() {
  const router = useRouter();
  const { settings } = useSiteSettings();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);

  async function doLogin(loginEmail: string, loginPassword: string, key: string) {
    setSubmitting(key);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (data.ok) {
        router.push(data.role === "platform_owner" ? "/platform" : "/admin");
        router.refresh();
      } else {
        setError(data.error ?? "Login failed.");
      }
    } catch {
      setError("Couldn't reach the server — try again.");
    } finally {
      setSubmitting(null);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await doLogin(email, password, "form");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#3d2a1a] via-[#2e1e12] to-[#221b15] px-6 py-12">
      <div className="w-full max-w-4xl">
        <h1 className="mt-2 text-center font-display text-3xl italic text-linen">
          {settings?.name ?? ""} Admin
        </h1>
        <p className="mt-2 text-center text-sm text-linen/60">
          Manage the menu, offers, and live orders.
        </p>

        <p className="mt-8 text-center text-xs font-medium uppercase tracking-[0.15em] text-linen/50">
          Demo — jump straight into any tier
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DEMO_CARDS.map((card) => (
            <button
              key={card.role}
              type="button"
              disabled={submitting !== null}
              onClick={() => doLogin(card.email, card.password, card.role)}
              className="flex flex-col rounded-2xl border border-linen/15 bg-espresso/50 p-4 text-left transition hover:border-saffron/60 hover:bg-espresso/70 disabled:cursor-wait disabled:opacity-60"
            >
              <span className="font-display text-lg italic text-linen">{card.role}</span>
              <span className="mt-1 text-xs font-medium uppercase tracking-[0.1em] text-saffron/80">
                {card.tagline}
              </span>
              <span className="mt-2 text-xs text-linen/60">{card.detail}</span>
              <span className="mt-3 text-xs font-semibold text-linen/40">
                {submitting === card.role ? "Signing in…" : "Enter →"}
              </span>
            </button>
          ))}

          <Link
            href="/menu"
            className="flex flex-col rounded-2xl border border-linen/15 bg-espresso/50 p-4 text-left transition hover:border-saffron/60 hover:bg-espresso/70"
          >
            <span className="font-display text-lg italic text-linen">Guest Site</span>
            <span className="mt-1 text-xs font-medium uppercase tracking-[0.1em] text-saffron/80">
              What a customer sees
            </span>
            <span className="mt-2 text-xs text-linen/60">Browse the menu and place an order, no login.</span>
            <span className="mt-3 text-xs font-semibold text-linen/40">Open →</span>
          </Link>
        </div>

        <div className="mx-auto mt-8 flex max-w-sm items-center gap-3 text-xs text-linen/30">
          <span className="h-px flex-1 bg-linen/15" />
          or sign in manually
          <span className="h-px flex-1 bg-linen/15" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-6 max-w-sm rounded-3xl border border-linen/15 bg-espresso/50 p-6 backdrop-blur-md"
        >
          <label htmlFor="adm-email" className="block text-xs font-medium uppercase tracking-[0.15em] text-linen/70">
            Email
          </label>
          <input
            id="adm-email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-linen/20 bg-espresso/40 px-4 py-3 text-sm text-linen placeholder:text-linen/40 focus:border-saffron focus:outline-none"
            placeholder="you@restaurant.com"
            suppressHydrationWarning
          />

          <label htmlFor="adm-password" className="mt-4 block text-xs font-medium uppercase tracking-[0.15em] text-linen/70">
            Password
          </label>
          <input
            id="adm-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-linen/20 bg-espresso/40 px-4 py-3 text-sm text-linen placeholder:text-linen/40 focus:border-saffron focus:outline-none"
            placeholder="••••••••"
          />

          {error && (
            <p role="alert" className="mt-3 text-sm text-saffron">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting !== null}
            className="mt-6 w-full rounded-full bg-saffron py-3 font-body text-sm font-semibold text-espresso transition-transform hover:scale-[1.02] disabled:cursor-wait disabled:opacity-60"
          >
            {submitting === "form" ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-linen/40">
          <Link href="/" className="underline underline-offset-2 hover:text-linen/70">
            ← Back to the website
          </Link>
        </p>
      </div>
    </main>
  );
}
