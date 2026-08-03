export type VenueSlug = "restaurant" | "cafe" | "beverages" | "bakery";
export type ModelTone = "warm" | "sage" | "charred" | "cream";

export type Venue = {
  slug: VenueSlug;
  name: string;
  tagline: string;
  intro: string;
  dishTone: ModelTone;
  accent: string;
  heroPhoto: { src: string; alt: string };
  gallery: { src: string; alt: string }[];
  featuredIds: string[];
  quickInfo: { hours: string; address: string; phone: string };
  faqs: { q: string; a: string }[];
};

export const VENUES: Venue[] = [
  {
    slug: "restaurant",
    name: "The Restaurant",
    tagline: "Pure Veg Punjabi & Tandoor",
    intro:
      "Rich Paneer Butter Masala, slow-cooked Dal Makhani, and golden tandoori breads cooked fresh over glowing hot clay tandoors.",
    dishTone: "charred",
    accent: "#b71c1c",
    heroPhoto: {
      src: "/food-photos/food_01.jpg",
      alt: "Authentic Paneer Butter Masala in rich tomato gravy",
    },
    gallery: [
      {
        src: "/food-photos/food_02.jpg",
        alt: "Golden tandoori kulcha with chole",
      },
      {
        src: "/food-photos/food_03.jpg",
        alt: "Prince Corner full Punjabi Thali spread",
      },
      {
        src: "/food-photos/food_04.jpg",
        alt: "Sizzling Paneer Tikka with mint chutney",
      },
    ],
    featuredIds: [
      "butter-paneer-masala",
      "dal-makhani",
      "paneer-tikka-masala",
      "prince-punjabi-thali",
    ],
    quickInfo: {
      hours: "Daily · 11:00 am – 11:00 pm",
      address: "Near Rameshwar Shopping Center, Vatva Road, Isanpur",
      phone: "+91 98765 43210",
    },
    faqs: [
      { q: "Is the restaurant 100% vegetarian?", a: "Yes! We are strictly 100% pure vegetarian with Jain options available for all major dishes." },
      { q: "Do you offer delivery?", a: "Yes, we deliver piping hot meals straight to your door across Ahmedabad." },
      { q: "Can we book tables for family gatherings?", a: "Absoluty! You can reserve tables online or call our manager directly." },
    ],
  },
  {
    slug: "cafe",
    name: "South Indian Dosa Counter",
    tagline: "Crisp Dosas & Steamed Idlis",
    intro:
      "Paper-thin golden dosas, soft steamed idlis, and crispy medu vadas served with hot sambar and fresh coconut chutney.",
    dishTone: "cream",
    accent: "#d4af37",
    heroPhoto: {
      src: "/food-photos/food_05.jpg",
      alt: "Golden crisp Masala Dosa with sambar and coconut chutney",
    },
    gallery: [
      {
        src: "/food-photos/food_06.jpg",
        alt: "Onion Tomato Uttapam on banana leaf",
      },
      {
        src: "/food-photos/food_07.jpg",
        alt: "Crisp Lacy Rava Dosa",
      },
      {
        src: "/menu-photos/menu_04.jpg",
        alt: "Steamed Idli Sambar",
      },
    ],
    featuredIds: [
      "masala-dosa",
      "idli-sambar",
      "uttapam",
      "medu-vada",
    ],
    quickInfo: {
      hours: "Daily · 8:00 am – 10:30 pm",
      address: "Maninagar Char Rasta, Rambaug Road",
      phone: "+91 98765 43210",
    },
    faqs: [
      { q: "Are dosas made fresh to order?", a: "Every single dosa is spread live on hot tawas upon ordering." },
      { q: "Do you have Jain coconut chutney?", a: "Yes, our sambar and chutneys are available in Jain options." },
    ],
  },
  {
    slug: "beverages",
    name: "Beverage & Falooda Bar",
    tagline: "Royal Faloodas & Chilled Lassi",
    intro:
      "Layers of rose syrup, basil seeds, rabri, and kulfi scoops alongside chilled dryfruit lassi and digestive masala chaas.",
    dishTone: "sage",
    accent: "#e7a73a",
    heroPhoto: {
      src: "/food-photos/food_16.jpg",
      alt: "Royal Falooda with kulfi and rose syrup",
    },
    gallery: [
      {
        src: "/menu-photos/menu_16.jpg",
        alt: "Chilled Masala Chaas with roasted cumin",
      },
      {
        src: "/food-photos/food_14.jpg",
        alt: "Frothy Cold Coffee glass",
      },
      {
        src: "/food-photos/food_15.jpg",
        alt: "Warm Gulab Jamun with syrup",
      },
    ],
    featuredIds: [
      "royal-falooda",
      "masala-chaas",
      "cold-coffee",
      "fresh-lime-soda",
    ],
    quickInfo: {
      hours: "Daily · 11:00 am – 11:30 pm",
      address: "Satellite Road, Near Jodhpur Cross Road",
      phone: "+91 98765 43210",
    },
    faqs: [
      { q: "Do you serve fresh juices?", a: "Yes! Freshly squeezed orange, pineapple, and watermelon juices served all day." },
      { q: "Are desserts eggless?", a: "100% eggless desserts and pure milk ice creams only." },
    ],
  },
  {
    slug: "bakery",
    name: "Street Food & Tawa Counter",
    tagline: "Pav Bhaji & Live Tawa Specialties",
    intro:
      "Sizzling Pav Bhaji slow-cooked with Amul butter, butter-rich Tawa Pulao, and fiery wok-tossed Hakka Noodles.",
    dishTone: "warm",
    accent: "#b71c1c",
    heroPhoto: {
      src: "/food-photos/food_11.jpg",
      alt: "Prince Special Pav Bhaji with buttered pav",
    },
    gallery: [
      {
        src: "/food-photos/food_08.jpg",
        alt: "Wok-tossed Hakka Noodles",
      },
      {
        src: "/food-photos/food_09.jpg",
        alt: "Chilli Paneer with bell peppers",
      },
      {
        src: "/food-photos/food_12.jpg",
        alt: "Crisp Pani Puri plate",
      },
    ],
    featuredIds: [
      "pav-bhaji",
      "vada-pav",
      "pani-puri",
      "bhel-puri",
    ],
    quickInfo: {
      hours: "Daily · 12:00 pm – 11:00 pm",
      address: "Vastrapur Lake Road",
      phone: "+91 98765 43210",
    },
    faqs: [
      { q: "Is Amul butter used for Pav Bhaji?", a: "We use 100% genuine Amul butter generously for all tawa items." },
      { q: "Can we order extra pav?", a: "Yes, butter-grilled extra pav portions are available on order." },
    ],
  },
];

export function getVenue(slug: string): Venue | undefined {
  return VENUES.find((v) => v.slug === slug);
}

export const RESTAURANT_TASTING = {
  title: "Prince Special Punjabi Thali",
  price: "₹250 per thali",
  note: "Complete traditional vegetarian feast served with unlimited warmth.",
  courses: [
    { order: "I", name: "Welcome Drink", dish: "Chilled Masala Chaas with mint & roasted cumin" },
    { order: "II", name: "Starter", dish: "Paneer Tikka with green chutney & kachumber salad" },
    { order: "III", name: "Main Curries", dish: "Butter Paneer Masala & Dal Makhani" },
    { order: "IV", name: "Breads & Rice", dish: "2 Butter Naan, Jeera Rice & Roasted Papad" },
    { order: "V", name: "Sweet Finish", dish: "2 Warm Gulab Jamun with Rose Syrup" },
  ],
};

export const RESTAURANT_HOURS = [
  { days: "Monday — Sunday", time: "11:00 am – 11:00 pm" },
];

export const CAFE_BREWS = [
  { name: "Kesar Pista Lassi", detail: "Thick creamy yogurt whipped with saffron & pistachios", price: "₹90" },
  { name: "Royal Special Falooda", detail: "Rose syrup, basil seeds, vermicelli & kulfi scoop", price: "₹150" },
  { name: "Chilled Masala Chaas", detail: "Spiced buttermilk with roasted cumin & coriander", price: "₹60" },
  { name: "Special Cutting Chai", detail: "Freshly brewed ginger-cardamom tea", price: "₹30" },
];

export const CAFE_MORNING = [
  { time: "8:00", event: "Live Dosa Counter opens — fresh batter ready" },
  { time: "11:00", event: "Full Punjabi Thalis & Tawa section available" },
  { time: "16:00", event: "Evening Chaat & Falooda rush" },
  { time: "23:00", event: "Kitchen closes" },
];

export const BAR_COCKTAILS = [
  { num: "01", name: "Royal Special Falooda", detail: "Rose syrup, basil seeds, rabri, kulfi scoop", price: "₹150" },
  { num: "02", name: "Kesar Pista Lassi", detail: "Rich saffron lassi topped with crushed almonds", price: "₹90" },
  { num: "03", name: "Fresh Mango Thandai", detail: "Chilled milk infused with nuts and crushed cardamom", price: "₹100" },
  { num: "04", name: "Fresh Lime Soda", detail: "Sweet & salted fizzy lime refresher", price: "₹60" },
];

export const BAR_LIBRARY = [
  { category: "Punjabi Gravies", count: "12 dishes" },
  { category: "South Indian Dosas", count: "10 varieties" },
  { category: "Indo-Chinese Wok", count: "8 items" },
  { category: "Desserts & Shakes", count: "9 options" },
];

export const BAR_NIGHTS = [
  { night: "Friday", event: "Weekend Special Paneer Thali Feast" },
  { night: "Saturday", event: "Live Tawa Pav Bhaji Festival" },
  { night: "Sunday", event: "Family Feast Combo Offers" },
];

export const BAKERY_SCHEDULE = [
  { time: "11:00", event: "Tawa heating for Pav Bhaji" },
  { time: "13:00", event: "Lunch thali rush" },
  { time: "18:00", event: "Evening street food & Chinese wok orders" },
  { time: "23:00", event: "Closing" },
];

export const BAKERY_BREADS = [
  { name: "Prince Special Pav Bhaji", detail: "Slow-cooked bhaji with melting Amul butter", price: "₹120" },
  { name: "Butter Cheese Pav Bhaji", detail: "Loaded with shredded Amul cheese", price: "₹150" },
  { name: "Tawa Pulao", detail: "Basmati rice wok-tossed with pav bhaji masala", price: "₹130" },
  { name: "Veg Hakka Noodles", detail: "Street-style wok-tossed noodles", price: "₹140" },
];
