"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function AdminLoginPage() {
  const router = useRouter();
  const { settings } = useSiteSettings();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.error ?? "Login failed.");
      }
    } catch {
      setError("Couldn't reach the server — try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#3d2a1a] via-[#2e1e12] to-[#221b15] px-6">
      <div className="w-full max-w-sm">
        <h1 className="mt-2 text-center font-display text-3xl italic text-linen">
          {settings?.name ?? ""} Admin
        </h1>
        <p className="mt-2 text-center text-sm text-linen/60">
          Manage the menu, offers, and live orders.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-3xl border border-linen/15 bg-espresso/50 p-6 backdrop-blur-md"
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
            disabled={submitting}
            className="mt-6 w-full rounded-full bg-saffron py-3 font-body text-sm font-semibold text-espresso transition-transform hover:scale-[1.02] disabled:cursor-wait disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign In"}
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
