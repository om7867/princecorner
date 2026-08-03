"use client";

import { useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { VENUES, type VenueSlug } from "@/data/venues";
import { PUBLIC_API_BASE_URL } from "@/lib/env";
import { telLink, whatsappLink } from "@/lib/site-settings";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useLuxuryReveal } from "@/hooks/useLuxuryReveal";

const inputClasses =
  "w-full rounded-xl border border-white/5 bg-white/[0.03] px-5 py-4 font-body text-sm text-linen placeholder:text-linen/30 backdrop-blur-md transition-all duration-300 focus:border-saffron/50 focus:bg-white/[0.05] focus:outline-none focus:ring-1 focus:ring-saffron/30 [color-scheme:dark]";
const labelClasses =
  "mb-2 block font-body text-xs font-semibold uppercase tracking-[0.2em] text-linen/60";

export function ReserveFlow() {
  const { settings } = useSiteSettings();
  const [venue, setVenue] = useState<VenueSlug>("restaurant");
  const [party, setParty] = useState(2);
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [reference, setReference] = useState("");
  const [summary, setSummary] = useState<{ date: string; time: string } | null>(null);
  const confirmRef = useRef<HTMLDivElement>(null);
  const containerRef = useLuxuryReveal();

  const today = new Date().toISOString().slice(0, 10);
  const activeVenue = VENUES.find((v) => v.slug === venue)!;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    setStatus("submitting");

    const form = new FormData(e.currentTarget);
    const date = String(form.get("date") ?? "");
    const time = String(form.get("time") ?? "");
    const payload = {
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      date,
      time,
      party_size: party,
      note: `[${activeVenue.name}] ${form.get("note") ?? ""}`.trim(),
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
        setSummary({ date, time });
        setStatus("success");
        requestAnimationFrame(() => {
          confirmRef.current?.focus();
          confirmRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      } else {
        setServerError("Something went wrong — please check your details and try again.");
        setStatus("idle");
      }
    } catch {
      setServerError("We couldn't reach the booking desk — please try again or call us.");
      setStatus("idle");
    }
  }

  return (
    <main ref={containerRef as any} className="relative z-10 text-linen bg-[#0e0b08] overflow-hidden">
      
      {/* 1 — Cinematic Hero with Massive Background Image */}
      <section
        aria-label="Reserve your table"
        className="relative flex min-h-[90vh] items-end pb-24 pt-48 px-6 lg:px-12"
      >
        <div className="absolute inset-0 z-0 overflow-hidden bg-[#0e0b08]">
          <div className="relative h-[120%] w-full -top-[10%]" data-parallax="0.2">
            <Image
              src="https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2070&auto=format&fit=crop"
              alt="Elegant dining table setting"
              fill
              className="object-cover opacity-50"
              priority
            />
            {/* Smooth gradient fading into the dark background below */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0e0b08]/30 via-[#0e0b08]/70 to-[#0e0b08]" />
          </div>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <p className="luxury-paragraph font-body text-sm uppercase tracking-[0.4em] text-saffron mb-8">
            {settings?.name ?? "The Restaurant"}
          </p>
          <h1 className="luxury-heading font-display text-6xl italic text-linen sm:text-8xl lg:text-[9rem] leading-[0.9]">
            Secure your <br />
            <span className="text-linen/50">place.</span>
          </h1>
        </div>
      </section>

      <div className="relative z-20 bg-[#0e0b08]">
        {/* 2 — Immersive Room Selector */}
        <section aria-label="Choose your room" className="px-6 py-24 lg:py-32 border-t border-white/5">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
              <div>
                <p className="luxury-paragraph font-body text-xs uppercase tracking-[0.3em] text-saffron mb-4">
                  Step 1
                </p>
                <h2 className="luxury-heading font-display text-4xl lg:text-6xl text-linen">
                  Select the Atmosphere.
                </h2>
              </div>
              <p className="luxury-paragraph font-body text-lg text-linen/50 max-w-sm font-light">
                Every room offers a distinct culinary narrative. Choose the backdrop for your evening.
              </p>
            </div>
            
            <div className="relative">
              <div className="flex flex-row overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none lg:grid lg:grid-cols-4 gap-6 no-scrollbar pb-8 lg:pb-0" role="radiogroup" aria-label="Venue">
                {VENUES.map((v, i) => {
                  const isActive = venue === v.slug;
                  return (
                    <button
                      key={v.slug}
                      role="radio"
                      aria-checked={isActive}
                      onClick={() => setVenue(v.slug)}
                      className={`shrink-0 snap-center w-[85vw] md:w-[45vw] lg:w-auto luxury-paragraph group relative overflow-hidden rounded-[2rem] border text-left transition-all duration-700 ease-[var(--ease-cubic)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron ${
                        isActive
                          ? "border-saffron/40 shadow-[0_10px_40px_rgba(231,167,58,0.1)] ring-1 ring-saffron/30 scale-[1.02] bg-[#1a130f]"
                          : "border-white/5 opacity-70 hover:opacity-100 hover:border-white/20 grayscale hover:grayscale-0 bg-white/[0.02]"
                      }`}
                      style={{ transitionDelay: `${i * 100}ms` }}
                    >
                      <div className="relative aspect-[4/5]">
                        <Image
                          src={v.heroPhoto.src}
                          alt={v.heroPhoto.alt}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div aria-hidden className={`absolute inset-0 bg-gradient-to-t transition-all duration-700 ${isActive ? 'from-espresso via-espresso/40 to-transparent' : 'from-[#0e0b08] via-[#0e0b08]/60 to-transparent'}`} />
                        <div className="absolute bottom-8 left-8 right-8">
                          <span className={`block font-display text-3xl sm:text-4xl italic transition-colors duration-500 ${isActive ? 'text-saffron' : 'text-linen'}`}>
                            {v.name}
                          </span>
                          {isActive && (
                            <span className="block mt-3 font-body text-xs uppercase tracking-widest text-linen/70 animate-[fade-rise_0.5s_ease-out]">
                              Selected
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Floating Mobile Horizontal Swipe Indicator */}
              <div className="lg:hidden absolute right-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none animate-pulse">
                <div className="bg-[#0e0b08]/80 backdrop-blur-md rounded-full p-4 border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col items-center gap-1">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-saffron">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="font-body text-[8px] font-bold uppercase tracking-widest text-linen">Swipe</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 — Glassmorphic Booking Widget */}
        <section aria-label="Booking details" className="px-6 py-24 lg:py-32 relative">
          
          <div className="mx-auto max-w-7xl mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
               <p className="luxury-paragraph font-body text-xs uppercase tracking-[0.3em] text-saffron mb-4">
                 Step 2
               </p>
               <h2 className="luxury-heading font-display text-4xl lg:text-6xl text-linen">
                 Confirm the Details.
               </h2>
            </div>
            <p className="luxury-paragraph font-body text-lg text-linen/50 max-w-sm font-light">
              Your table awaits. Provide your details and we will ensure everything is prepared for your arrival.
            </p>
          </div>

          <div className="luxury-paragraph mx-auto max-w-4xl rounded-[2rem] border border-white/5 bg-[#140e0a] p-8 shadow-2xl sm:p-16 relative overflow-hidden">
            {/* Subtle Inner Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[150%] bg-saffron/[0.03] blur-[150px] pointer-events-none rounded-full" />
            
            {/* Accent Line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-terracotta/30 to-transparent" />

            <div className="relative z-10">
              {status === "success" ? (
                <div
                  ref={confirmRef}
                  tabIndex={-1}
                  role="status"
                  className="flex flex-col items-center py-12 text-center outline-none motion-safe:animate-[fade-rise_0.7s_var(--ease-cubic)]"
                >
                  <span className="flex h-24 w-24 items-center justify-center rounded-full bg-saffron/10 border border-saffron/20 shadow-[0_0_40px_rgba(231,167,58,0.2)]">
                    <svg width="40" height="40" viewBox="0 0 30 30" fill="none" aria-hidden>
                      <circle cx="15" cy="15" r="13.5" stroke="#e7a73a" strokeWidth="1.5" />
                      <path d="M9.5 15.5l3.6 3.6L20.5 11" stroke="#e7a73a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <h3 className="mt-10 font-display text-5xl italic text-linen">
                    The candle is lit.
                  </h3>
                  <p className="mt-6 max-w-md text-lg text-linen/70 leading-relaxed font-light">
                    Your table at <span className="text-linen font-medium">{activeVenue.name}</span> is confirmed for{" "}
                    <span className="text-linen font-medium">{summary?.date}</span> at <span className="text-linen font-medium">{summary?.time}</span>. 
                    Party of {party}.
                  </p>
                  <div className="mt-10 p-6 rounded-2xl border border-white/5 bg-black/40 backdrop-blur-md w-full max-w-sm">
                    <p className="font-body text-xs uppercase tracking-[0.2em] text-linen/40 mb-2">Reference Code</p>
                    <p className="font-display text-3xl tracking-wider text-saffron">{reference}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="mt-12 group relative rounded-full border border-linen/20 px-10 py-4 font-body text-xs font-bold uppercase tracking-[0.2em] text-linen transition-all hover:border-linen hover:bg-white/5"
                  >
                    Book Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="grid gap-8 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="rf-name" className={labelClasses}>Full Name</label>
                      <input id="rf-name" name="name" type="text" required minLength={2} autoComplete="name" placeholder="John Doe" className={inputClasses} />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="rf-phone" className={labelClasses}>Phone Number</label>
                      <input id="rf-phone" name="phone" type="tel" required autoComplete="tel" placeholder="+1 (555) 000-0000" className={inputClasses} />
                    </div>
                    <div>
                      <label htmlFor="rf-date" className={labelClasses}>Date</label>
                      <input id="rf-date" name="date" type="date" required min={today} className={inputClasses} />
                    </div>
                    <div>
                      <label htmlFor="rf-time" className={labelClasses}>Time</label>
                      <select id="rf-time" name="time" required defaultValue="" className={inputClasses}>
                        <option value="" disabled>Select a time</option>
                        {(settings?.timeslots ?? []).map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="rf-party" className={labelClasses}>Party Size</label>
                      <select
                        id="rf-party"
                        value={party}
                        onChange={(e) => setParty(Number(e.target.value))}
                        className={inputClasses}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? "Guest" : "Guests"}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="rf-note" className={labelClasses}>
                        Special Requests <span className="normal-case text-linen/30 font-normal tracking-normal">(Optional)</span>
                      </label>
                      <input id="rf-note" name="note" type="text" placeholder="Allergies, occasion…" className={inputClasses} />
                    </div>
                  </div>

                  {serverError && (
                    <div className="mt-8 p-4 rounded-xl border border-red-500/20 bg-red-500/10 flex items-center justify-center gap-3">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-red-400">
                         <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM7 4h2v5H7V4zm1 10a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="currentColor"/>
                      </svg>
                      <p role="alert" className="text-sm font-medium text-red-200">{serverError}</p>
                    </div>
                  )}

                  <div className="mt-16 pt-10 border-t border-white/5">
                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="group relative w-full overflow-hidden rounded-full bg-saffron px-8 py-5 font-body text-sm font-bold uppercase tracking-[0.2em] text-espresso transition-transform duration-500 hover:scale-[1.02] disabled:cursor-wait disabled:opacity-50"
                    >
                      <span className="relative z-10">
                        {status === "submitting" ? "Securing Table..." : "Complete Reservation"}
                      </span>
                      <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
                    </button>
                    
                    {settings && (
                      <div className="mt-8 text-center font-body text-xs text-linen/40 uppercase tracking-widest flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                        <span>Prefer to speak?</span>
                        <div className="flex items-center gap-4">
                          <a href={telLink(settings)} className="text-linen/70 hover:text-saffron transition-colors">
                            {settings.phone}
                          </a>
                          <span className="w-1 h-1 rounded-full bg-linen/20" />
                          <a
                            href={whatsappLink(settings)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-linen/70 hover:text-saffron transition-colors"
                          >
                            WhatsApp
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        <div aria-hidden className="h-[10vh]" />
      </div>
    </main>
  );
}
