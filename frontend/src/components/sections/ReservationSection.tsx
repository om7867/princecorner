"use client";

import { useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { unsplash } from "@/lib/unsplash";
import { PUBLIC_API_BASE_URL } from "@/lib/env";
import { telLink, whatsappLink } from "@/lib/site-settings";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const inputClasses =
  "w-full rounded-xl border border-linen/20 bg-espresso/40 px-4 py-3 font-body text-sm text-linen placeholder:text-linen/40 backdrop-blur-sm transition-colors focus:border-saffron focus:outline-none [color-scheme:dark]";
const labelClasses =
  "mb-1.5 block font-body text-xs font-medium uppercase tracking-[0.15em] text-linen/70";

export function ReservationSection() {
  const { settings } = useSiteSettings();
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [reference, setReference] = useState<string>("");
  const confirmRef = useRef<HTMLDivElement>(null);

  const today = new Date().toISOString().slice(0, 10);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    setStatus("submitting");

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      date: String(form.get("date") ?? ""),
      time: String(form.get("time") ?? ""),
      party_size: Number(form.get("party") ?? 2),
      note: String(form.get("note") ?? ""),
    };

    try {
      const res = await fetch(`${PUBLIC_API_BASE_URL}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setReference(data.reference_code);
        setStatus("success");
        requestAnimationFrame(() => confirmRef.current?.focus());
      } else {
        setServerError("Something went wrong — please check your details and try again.");
        setStatus("idle");
      }
    } catch {
      setServerError(
        "We couldn't reach the booking desk. Please try again, or call us."
      );
      setStatus("idle");
    }
  }

  return (
    <section
      id="reservation"
      aria-label="Reserve a table"
      className="relative overflow-hidden px-6 py-24 sm:py-32"
    >
      <div aria-hidden className="absolute inset-0">
        <Image
          src="/food-photos/storefront_hero.jpg"
          alt="Prince Corner Storefront"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-espresso/85" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,_rgba(231,167,58,0.2),_transparent_60%)]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div className="text-center lg:text-left">
          <p className="font-body text-xs uppercase tracking-[0.35em] text-saffron">
            Come Say Hello
          </p>
          <h2 className="mt-4 text-balance font-display text-4xl italic text-linen sm:text-5xl">
            Our table is yours
          </h2>
          <p className="mx-auto mt-5 max-w-md text-balance text-linen/75 lg:mx-0">
            Pick a date, tell us how many, and we&apos;ll have the candles lit.
            Larger party or a special occasion? Add a note and the host will
            call you back.
          </p>
          {settings && (
            <div className="mt-8 flex flex-col items-center gap-3 text-sm text-linen/60 sm:flex-row lg:justify-start">
              <a href={telLink(settings)} className="underline-offset-4 hover:text-saffron hover:underline">
                {settings.phone}
              </a>
              <span aria-hidden className="hidden sm:inline">·</span>
              <a
                href={whatsappLink(settings)}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:text-saffron hover:underline"
              >
                WhatsApp us
              </a>
            </div>
          )}
        </div>

        {/* Booking panel */}
        <div className="rounded-3xl border border-linen/15 bg-espresso/50 p-6 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-8">
          {status === "success" ? (
            <div
              ref={confirmRef}
              tabIndex={-1}
              role="status"
              className="flex flex-col items-center py-10 text-center outline-none motion-safe:animate-[fade-rise_0.7s_var(--ease-cubic)]"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-saffron/15">
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden>
                  <circle cx="15" cy="15" r="13.5" stroke="#e7a73a" strokeWidth="1.5" />
                  <path
                    d="M9.5 15.5l3.6 3.6L20.5 11"
                    stroke="#e7a73a"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <h3 className="mt-5 font-display text-2xl italic text-linen">
                The table is set
              </h3>
              <p className="mt-2 max-w-xs text-sm text-linen/70">
                Your booking reference is{" "}
                <span className="font-semibold text-saffron">{reference}</span>.
                We&apos;ll confirm by phone shortly.
              </p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-7 rounded-full border border-linen/30 px-6 py-2.5 font-body text-xs font-semibold uppercase tracking-[0.15em] text-linen transition-colors hover:border-linen/70"
              >
                Book another table
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="rsv-name" className={labelClasses}>
                    Name
                  </label>
                  <input
                    id="rsv-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    minLength={2}
                    placeholder="Your name"
                    className={inputClasses}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="rsv-phone" className={labelClasses}>
                    Phone
                  </label>
                  <input
                    id="rsv-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    placeholder="+1 555 000 0000"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label htmlFor="rsv-date" className={labelClasses}>
                    Date
                  </label>
                  <input
                    id="rsv-date"
                    name="date"
                    type="date"
                    required
                    min={today}
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label htmlFor="rsv-time" className={labelClasses}>
                    Time
                  </label>
                  <select
                    id="rsv-time"
                    name="time"
                    required
                    defaultValue=""
                    className={inputClasses}
                  >
                    <option value="" disabled>
                      Pick a time
                    </option>
                    {(settings?.timeslots ?? []).map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="rsv-party" className={labelClasses}>
                    Guests
                  </label>
                  <select
                    id="rsv-party"
                    name="party"
                    required
                    defaultValue="2"
                    className={inputClasses}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "guest" : "guests"}
                      </option>
                    ))}
                    <option value="9">9+ (we&apos;ll call you)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="rsv-note" className={labelClasses}>
                    Note <span className="normal-case text-linen/40">(optional)</span>
                  </label>
                  <input
                    id="rsv-note"
                    name="note"
                    type="text"
                    placeholder="Anniversary, window seat…"
                    className={inputClasses}
                  />
                </div>
              </div>

              {serverError && (
                <p role="alert" className="mt-4 text-sm text-saffron">
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="mt-6 w-full rounded-full bg-saffron px-8 py-3.5 font-body text-sm font-semibold tracking-wide text-espresso transition-all duration-300 ease-[var(--ease-cubic)] hover:scale-[1.02] disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
              >
                {status === "submitting" ? "Setting your table…" : "Reserve a Table"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
