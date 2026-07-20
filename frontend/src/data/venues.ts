import { unsplash } from "@/lib/unsplash";

export type VenueSlug = "restaurant" | "cafe" | "bar" | "bakery";
export type ModelTone = "warm" | "sage" | "charred" | "cream";

export type Venue = {
  slug: VenueSlug;
  name: string;
  tagline: string;
  intro: string;
  /** Tone for the procedural 3D dish in the venue hero. */
  dishTone: ModelTone;
  /** Accent hex used for the hero glow — stays within the brand palette. */
  accent: string;
  heroPhoto: { src: string; alt: string };
  gallery: { src: string; alt: string }[];
  featuredIds: string[];
  /** Above-the-fold essentials — hours, address, phone (restaurant-site best practice). */
  quickInfo: { hours: string; address: string; phone: string };
  faqs: { q: string; a: string }[];
};

export const VENUES: Venue[] = [
  {
    slug: "restaurant",
    name: "The Restaurant",
    tagline: "Dinner, unhurried",
    intro:
      "Golden-hour lighting, hand-thrown ceramics, and a short seasonal menu cooked over fire. This is the room at full depth — settle in.",
    dishTone: "charred",
    accent: "#e7a73a",
    heroPhoto: {
      src: unsplash("1414235077428-338989a2e8c0", 1600),
      alt: "A plated dish being finished at a candlelit restaurant table",
    },
    gallery: [
      {
        src: unsplash("1631515243349-e0cb75fb8d3a"),
        alt: "Fine-dining Indian vegetarian thali",
      },
      {
        src: unsplash("1585937421612-70a008356fbe"),
        alt: "Rich paneer delicacy on a rustic table",
      },
      {
        src: unsplash("1512621776951-a57141f2eefd"),
        alt: "A vibrant seasonal bowl from the kitchen",
      },
    ],
    featuredIds: [
      "truffle-pav-bhaji",
      "smoked-paneer-tikka",
      "wild-mushroom-risotto",
      "saffron-pulav",
    ],
    quickInfo: {
      hours: "Tue – Sun · from 5:30 pm",
      address: "14 Baker's Lane, Old Mill District",
      phone: "+1 (000) 000-0000",
    },
    faqs: [
      { q: "Do you take walk-ins?", a: "We hold a third of the dining room for walk-ins every night. Come early or late and we'll usually find you a seat within twenty minutes." },
      { q: "Can you handle dietary restrictions?", a: "Absolutely — the tasting menu adapts to vegetarian, gluten-free, and most allergies. Tell us when you book and the kitchen will plan around you." },
      { q: "Is there a dress code?", a: "No. Come as you are — the fire is doing the dressing up." },
      { q: "Do you charge corkage?", a: "You're welcome to bring a special bottle. Corkage is $25, waived on Sundays." },
    ],
  },
  {
    slug: "cafe",
    name: "The Café",
    tagline: "Mornings, poured slowly",
    intro:
      "Single-origin beans roasted in-house, milk steamed to silk, and a counter full of things still warm from the oven. Stay for one more cup.",
    dishTone: "cream",
    accent: "#c1622c",
    heroPhoto: {
      src: unsplash("1509042239860-f550ce710b93", 1600),
      alt: "Hand-poured espresso cups with latte art on a café counter",
    },
    gallery: [
      {
        src: unsplash("1495474472287-4d71bcdd2085"),
        alt: "Friends raising latte cups together",
      },
      {
        src: unsplash("1567620905732-2d1ec7ab7445"),
        alt: "Golden pancake stack with syrup being poured",
      },
      {
        src: unsplash("1563805042-7684c019e1cb"),
        alt: "A layered dessert jar from the café counter",
      },
    ],
    featuredIds: [
      "hand-poured-espresso",
      "olive-oil-cake",
      "burrata-fig",
      "honey-panna-cotta",
    ],
    quickInfo: {
      hours: "Daily · 7 am – 4 pm",
      address: "14 Baker's Lane, Old Mill District",
      phone: "+1 (000) 000-0000",
    },
    faqs: [
      { q: "Can I work on my laptop?", a: "Weekdays, yes — the long table has outlets and the Wi-Fi is fast. Weekends we keep the tables for conversation." },
      { q: "Are dogs welcome?", a: "On the terrace, always. There's a water bowl and usually a biscuit going spare." },
      { q: "Do you have decaf and alt milks?", a: "A properly good decaf, plus oat, almond, and soy at no extra charge." },
      { q: "Do you sell your beans?", a: "Every week's roast is on the shelf in 250g bags — whole bean or ground to order." },
    ],
  },
  {
    slug: "bar",
    name: "The Bar",
    tagline: "Evenings, stirred not rushed",
    intro:
      "Applewood smoke, garden herbs, and spirits worth sipping. A low-lit corner for long conversations and drinks built like small rituals.",
    dishTone: "sage",
    accent: "#6b7a4f",
    heroPhoto: {
      src: unsplash("1470337458703-46ad1756a187", 1600),
      alt: "An old fashioned cocktail being strained over ice at the bar",
    },
    gallery: [
      {
        src: unsplash("1551538827-9c037cb4f32a"),
        alt: "A garden fizz cocktail with fresh herbs and lime",
      },
      {
        src: unsplash("1551024506-0bccd828d307"),
        alt: "Dark chocolate dessert with warm caramel pour",
      },
      {
        src: unsplash("1504674900247-0877df9cc836"),
        alt: "Plates of food styled on the bar counter",
      },
    ],
    featuredIds: [
      "smoked-old-fashioned",
      "sage-garden-fizz",
      "truffle-fries",
      "dark-chocolate-tart",
    ],
    quickInfo: {
      hours: "Wed – Sun · 5 pm til late",
      address: "14 Baker's Lane, Old Mill District",
      phone: "+1 (000) 000-0000",
    },
    faqs: [
      { q: "Do I need a reservation?", a: "The bar itself is walk-in only. Booths for four or more can be booked ahead — worth it on Thursdays when the jazz trio plays." },
      { q: "When is happy hour?", a: "Golden hour runs Friday 5–7 pm: half-price spritzes and a free plate of sourdough with anything smoked." },
      { q: "How late does the kitchen run?", a: "Small plates until 11 pm, cheese and dessert until close." },
      { q: "Can you make it non-alcoholic?", a: "Every drink on the list has a zero-proof build we're genuinely proud of. Just ask." },
    ],
  },
  {
    slug: "bakery",
    name: "The Bakery",
    tagline: "Bread, three days in the making",
    intro:
      "Levain fed by hand, crusts that crackle, and shelves that empty by noon. Everything here starts with flour, water, salt, and patience.",
    dishTone: "warm",
    accent: "#e7a73a",
    heroPhoto: {
      src: unsplash("1517433670267-08bbd4be890f", 1600),
      alt: "Bakery shelves stacked with fresh pastries and baguettes",
    },
    gallery: [
      {
        src: unsplash("1509440159596-0249088772ff"),
        alt: "Rustic sourdough loaves dusted with flour",
      },
      {
        src: unsplash("1563805042-7684c019e1cb"),
        alt: "Layered chocolate dessert jar with cream",
      },
      {
        src: unsplash("1567620905732-2d1ec7ab7445"),
        alt: "A golden stack of pancakes with syrup at the bakery",
      },
    ],
    featuredIds: [
      "sourdough-board",
      "olive-oil-cake",
      "dark-chocolate-tart",
      "honey-panna-cotta",
    ],
    quickInfo: {
      hours: "Daily · 6:30 am – sold out",
      address: "14 Baker's Lane, Old Mill District",
      phone: "+1 (000) 000-0000",
    },
    faqs: [
      { q: "Can I reserve a loaf?", a: "Yes — order by 4 pm the day before and we'll hold it past the noon rush. Standing weekly orders welcome." },
      { q: "Do you sell your starter?", a: "We'll happily scoop you some levain for free — bring a jar and ask any baker." },
      { q: "Do you bake gluten-free?", a: "Wednesdays and Saturdays we run a dedicated gluten-free bake — buckwheat loaves and almond financiers." },
      { q: "Do you supply restaurants?", a: "We bake for a handful of kitchens nearby. Write to us for the wholesale list and tasting box." },
    ],
  },
];

export function getVenue(slug: string): Venue | undefined {
  return VENUES.find((v) => v.slug === slug);
}

/* ── Per-venue editorial content (CMS-swappable) ─────────────────── */

export const RESTAURANT_TASTING = {
  title: "The Tasting",
  price: "$78 per guest",
  note: "Five courses, changed with the market. Wine pairing available.",
  courses: [
    { order: "I", name: "To Begin", dish: "Three-day sourdough, whipped cultured butter" },
    { order: "II", name: "The Earth", dish: "Smoked paneer, charred pepper puree, mint oil" },
    { order: "III", name: "The Field", dish: "Wild mushroom risotto, black truffle, aged parmesan" },
    { order: "IV", name: "The Hearth", dish: "Heritage saffron pulav, slow-cooked dal makhani" },
    { order: "V", name: "To Finish", dish: "Dark chocolate tart, espresso crust, sea salt" },
  ],
};

export const RESTAURANT_HOURS = [
  { days: "Tuesday — Thursday", time: "5:30 pm – 10:00 pm" },
  { days: "Friday — Saturday", time: "5:30 pm – 11:30 pm" },
  { days: "Sunday", time: "5:00 pm – 9:00 pm" },
  { days: "Monday", time: "Closed — the kitchen rests" },
];

export const CAFE_BREWS = [
  { name: "Espresso", detail: "Single origin, 18g in / 36g out, stone fruit and cocoa", price: "$4" },
  { name: "V60 Pour-Over", detail: "Hand-poured over three minutes, floral and bright", price: "$6" },
  { name: "Cold Brew", detail: "Steeped 18 hours, chocolate-forward, served over one big cube", price: "$5.5" },
  { name: "Batch Filter", detail: "The everyday cup — balanced, comforting, bottomless before 9am", price: "$3.5" },
];

export const CAFE_MORNING = [
  { time: "7:00", event: "Doors open — first batch of filter is already brewed" },
  { time: "7:30", event: "Pastries out of the oven and onto the counter" },
  { time: "9:00", event: "Bottomless filter ends, pour-over bar opens" },
  { time: "14:00", event: "Afternoon menu — toasties, cakes, and slower coffees" },
];

export const BAR_COCKTAILS = [
  { num: "01", name: "Smoked Old Fashioned", detail: "Bourbon, demerara, aromatic bitters, applewood smoke", price: "$15" },
  { num: "02", name: "Sage Garden Fizz", detail: "Gin, garden sage, elderflower, soda, citrus oil", price: "$13" },
  { num: "03", name: "Terracotta Negroni", detail: "Blood orange gin, sweet vermouth, campari, burnt orange coin", price: "$14" },
  { num: "04", name: "Espresso Martini", detail: "House espresso, vodka, coffee liqueur, saline", price: "$14" },
  { num: "05", name: "Linen Spritz", detail: "White vermouth, chamomile, prosecco, lemon ribbon", price: "$12" },
];

export const BAR_LIBRARY = [
  { category: "Whiskey & Bourbon", count: "14 pours" },
  { category: "Gin", count: "9 pours" },
  { category: "Agave", count: "7 pours" },
  { category: "Amaro & Digestif", count: "11 pours" },
];

export const BAR_NIGHTS = [
  { night: "Thursday", event: "Live jazz trio, 8pm — no cover, arrive early" },
  { night: "Friday", event: "Golden hour: half-price spritzes, 5–7pm" },
  { night: "Sunday", event: "Vinyl night — bring a record, the first pour is on us" },
];

export const BAKERY_SCHEDULE = [
  { time: "5:00", event: "The levain is fed — it's older than the bakery itself" },
  { time: "6:30", event: "First loaves out of the deck oven" },
  { time: "8:00", event: "Laminated pastries hit the counter, still warm" },
  { time: "12:00", event: "Most days, the shelves are bare by noon" },
];

export const BAKERY_BREADS = [
  { name: "Country Levain", detail: "Our signature — 3-day ferment, dark crust", price: "$9" },
  { name: "Seeded Rye", detail: "Dense, malty, built for butter", price: "$10" },
  { name: "Olive & Rosemary", detail: "Castelvetrano olives folded by hand", price: "$11" },
  { name: "Baguette", detail: "Baked twice daily — morning and 3pm", price: "$5" },
  { name: "Cardamom Knot", detail: "Buttery, fragrant, and gone by 10am", price: "$6" },
];
