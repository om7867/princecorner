/**
 * ── SITE CONFIG ──────────────────────────────────────────────────────
 * The one file to edit when rebranding this demo for a new client pitch.
 * Everything here flows into the navbar, footer, floating buttons,
 * reservation flow, announcement bar, and SEO schema.
 */
export const SITE = {
  name: "Smaplee",
  tagline: "Restaurant · Café · Bar · Bakery",
  description:
    "Smaplee is a modern-yet-cozy restaurant & café. Explore our menu, reserve a table, and come say hello.",
  /** Swap for the production domain before deploying. */
  url: "https://smaplee-demo.vercel.app",

  address: {
    street: "14 Baker's Lane",
    area: "Old Mill District",
    city: "Your City",
    /** Feeds the "Get Directions" button. */
    mapsQuery: "14 Baker's Lane Old Mill District",
  },

  phone: "+1 (000) 000-0000",
  /** Digits only, with country code — feeds wa.me links. */
  whatsapp: "10000000000",
  whatsappGreeting: "Hi Smaplee! I'd like to book a table.",
  email: "hello@smaplee.example",

  hours: [
    { days: "Monday — Friday", time: "7:00 am – 11:30 pm" },
    { days: "Saturday", time: "8:00 am – 12:00 am" },
    { days: "Sunday", time: "8:00 am – 9:00 pm" },
  ],

  /** Set to null to hide the offer banner. Editable in one line — that's the pitch. */
  announcement: {
    text: "This week — live jazz Thursday 8pm · Golden hour Fri 5–7pm: half-price spritzes",
    href: "/venue/bar",
    label: "See what's on",
  } as { text: string; href: string; label: string } | null,

  /** Reservation time slots offered by the booking form. */
  timeSlots: [
    "12:00", "12:30", "13:00", "13:30", "14:00",
    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00",
  ],

  /** Agency credit shown in the footer of every page. */
  builtBy: {
    name: "Kelvion Tech",
    email: "kelviontech@gmail.com",
    note: "Want a website like this for your restaurant?",
  },
};

export function whatsappLink(message = SITE.whatsappGreeting): string {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function directionsLink(): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    SITE.address.mapsQuery
  )}`;
}

export function telLink(): string {
  return `tel:${SITE.phone.replace(/[^+\d]/g, "")}`;
}
