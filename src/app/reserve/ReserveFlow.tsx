"use client";

import { useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { VENUES, type VenueSlug } from "@/data/venues";
import { SITE, telLink, whatsappLink } from "@/data/site";
import { WorldCanvas } from "@/scenes/core/WorldCanvas";
import { ReserveWorld, RESERVE_KEYFRAMES } from "@/scenes/worlds/ReserveWorld";

type FieldErrors = Partial<Record<"name" | "phone" | "date" | "time" | "party", string>>;

const inputClasses =
  "w-full rounded-xl border border-linen/20 bg-espresso/50 px-4 py-3 font-body text-sm text-linen placeholder:text-linen/40 backdrop-blur-sm transition-colors focus:border-saffron focus:outline-none [color-scheme:dark]";
const labelClasses =
  "mb-1.5 block font-body text-xs font-medium uppercase tracking-[0.15em] text-linen/70";

export function ReserveFlow() {
  const [venue, setVenue] = useState<VenueSlug>("restaurant");
  const [party, setParty] = useState(2);
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [reference, setReference] = useState("");
  const [summary, setSummary] = useState<{ date: string; time: string } | null>(null);
  const confirmRef = useRef<HTMLDivElement>(null);

  const today = new Date().toISOString().slice(0, 10);
  const activeVenue = VENUES.find((v) => v.slug === venue)!;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    setErrors({});
    setStatus("submitting");

    const form = new FormData(e.currentTarget);
    const payload = {
      ...Object.fromEntries(form.entries()),
      party: String(party),
      note: `[${activeVenue.name}] ${form.get("note") ?? ""}`.trim(),
    };

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok) {
        setReference(data.reference);
        setSummary({
          date: String(form.get("date") ?? ""),
          time: String(form.get("time") ?? ""),
        });
        setStatus("success");
        requestAnimationFrame(() => confirmRef.current?.focus());
      } else if (data.errors) {
        setErrors(data.errors);
        setStatus("idle");
      } else {
        setServerError(data.error ?? "Something went wrong — please try again.");
        setStatus("idle");
      }
    } catch {
      setServerError("We couldn't reach the booking desk — please try again or call us.");
      setStatus("idle");
    }
  }

  return (
    <>
      <WorldCanvas
        keyframes={RESERVE_KEYFRAMES}
        backdrop="bg-gradient-to-b from-[#241811] via-[#181210] to-[#100c0a]"
      >
        <ReserveWorld partySize={party} confirmed={status === "success"} />
      </WorldCanvas>

      <main className="relative z-10 text-linen">
        {/* 1 — Hero */}
        <section
          aria-label="Reserve your table"
          className="relative flex min-h-[70vh] items-center"
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-espresso/80 via-espresso/30 to-transparent"
          />
          <div className="relative z-10 mx-auto w-full max-w-3xl px-6 pt-24 text-center">
            <p className="font-body text-xs uppercase tracking-[0.35em] text-saffron">
              {SITE.name} — Come Say Hello
            </p>
            <h1 className="mt-5 text-balance font-display text-5xl italic text-linen sm:text-6xl">
              Reserve your table
            </h1>
            <p className="mx-auto mt-5 max-w-md text-balance text-linen/80">
              Pick a room and a night. Watch the table below — it sets itself
              as your party grows.
            </p>
          </div>
        </section>

        {/* 2 — Choose your room */}
        <section aria-label="Choose your room" className="px-6 pb-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center font-body text-xs uppercase tracking-[0.3em] text-linen/60">
              Choose your room
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4" role="radiogroup" aria-label="Venue">
              {VENUES.map((v) => (
                <button
                  key={v.slug}
                  role="radio"
                  aria-checked={venue === v.slug}
                  onClick={() => setVenue(v.slug)}
                  className={`group relative overflow-hidden rounded-2xl border text-left transition-all duration-300 ease-[var(--ease-cubic)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron ${
                    venue === v.slug
                      ? "border-saffron shadow-lg shadow-saffron/10"
                      : "border-linen/15 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="relative aspect-[5/3]">
                    <Image
                      src={v.heroPhoto.src}
                      alt={v.heroPhoto.alt}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-espresso/90 to-transparent" />
                    <span className="absolute bottom-2.5 left-3 font-display text-base italic text-linen">
                      {v.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 3 — The form over the 3D table */}
        <section aria-label="Booking details" className="px-6 py-14">
          <div className="mx-auto max-w-xl rounded-3xl border border-linen/15 bg-espresso/60 p-6 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-8">
            {status === "success" ? (
              <div
                ref={confirmRef}
                tabIndex={-1}
                role="status"
                className="flex flex-col items-center py-8 text-center outline-none motion-safe:animate-[fade-rise_0.7s_var(--ease-cubic)]"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-saffron/15">
                  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden>
                    <circle cx="15" cy="15" r="13.5" stroke="#e7a73a" strokeWidth="1.5" />
                    <path d="M9.5 15.5l3.6 3.6L20.5 11" stroke="#e7a73a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <h3 className="mt-5 font-display text-2xl italic text-linen">
                  The candle is lit
                </h3>
                <p className="mt-2 max-w-sm text-sm text-linen/70">
                  {activeVenue.name}, {summary?.date} at {summary?.time}, table
                  for {party}. Reference{" "}
                  <span className="font-semibold text-saffron">{reference}</span> —
                  we&apos;ll confirm by phone shortly.
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
                <p className="font-body text-xs uppercase tracking-[0.3em] text-saffron">
                  {activeVenue.name}
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="rf-name" className={labelClasses}>Name</label>
                    <input id="rf-name" name="name" type="text" required autoComplete="name" placeholder="Your name" aria-invalid={!!errors.name} className={inputClasses} />
                    {errors.name && <p role="alert" className="mt-1 text-xs text-saffron">{errors.name}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="rf-phone" className={labelClasses}>Phone</label>
                    <input id="rf-phone" name="phone" type="tel" required autoComplete="tel" placeholder="+1 555 000 0000" aria-invalid={!!errors.phone} className={inputClasses} />
                    {errors.phone && <p role="alert" className="mt-1 text-xs text-saffron">{errors.phone}</p>}
                  </div>
                  <div>
                    <label htmlFor="rf-date" className={labelClasses}>Date</label>
                    <input id="rf-date" name="date" type="date" required min={today} aria-invalid={!!errors.date} className={inputClasses} />
                    {errors.date && <p role="alert" className="mt-1 text-xs text-saffron">{errors.date}</p>}
                  </div>
                  <div>
                    <label htmlFor="rf-time" className={labelClasses}>Time</label>
                    <select id="rf-time" name="time" required defaultValue="" aria-invalid={!!errors.time} className={inputClasses}>
                      <option value="" disabled>Pick a time</option>
                      {SITE.timeSlots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                    {errors.time && <p role="alert" className="mt-1 text-xs text-saffron">{errors.time}</p>}
                  </div>
                  <div>
                    <label htmlFor="rf-party" className={labelClasses}>Guests</label>
                    <select
                      id="rf-party"
                      value={party}
                      onChange={(e) => setParty(Number(e.target.value))}
                      className={inputClasses}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? "guest" : "guests"}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-[11px] text-linen/45">
                      The 3D table sets a place for each guest.
                    </p>
                  </div>
                  <div>
                    <label htmlFor="rf-note" className={labelClasses}>
                      Note <span className="normal-case text-linen/40">(optional)</span>
                    </label>
                    <input id="rf-note" name="note" type="text" placeholder="Allergies, occasion…" className={inputClasses} />
                  </div>
                </div>

                {serverError && (
                  <p role="alert" className="mt-4 text-sm text-saffron">{serverError}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="mt-6 w-full rounded-full bg-saffron px-8 py-3.5 font-body text-sm font-semibold tracking-wide text-espresso transition-all duration-300 ease-[var(--ease-cubic)] hover:scale-[1.02] disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
                >
                  {status === "submitting" ? "Setting your table…" : "Reserve a Table"}
                </button>
                <p className="mt-4 text-center text-xs text-linen/50">
                  Prefer a human?{" "}
                  <a href={telLink()} className="underline underline-offset-2 hover:text-saffron">
                    {SITE.phone}
                  </a>{" "}
                  ·{" "}
                  <a
                    href={whatsappLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-saffron"
                  >
                    WhatsApp us
                  </a>
                </p>
              </form>
            )}
          </div>
        </section>

        {/* 4 — Let the confirmed table breathe */}
        <div aria-hidden className="h-[45vh]" />
      </main>
    </>
  );
}
