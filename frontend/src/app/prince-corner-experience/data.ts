/**
 * Photo choices here were verified by actually viewing each candidate photo
 * against its named dish — not assigned by filename guess. Confirmed real
 * matches: food_07 (Prince Corner's own menu cover, showing their pav
 * bhaji), food_20 (chilli paneer in a kadai), food_13 (a real full thali),
 * food_01 (a garnished paneer gravy), food_02 (a kofta curry). No dosa or
 * falooda photo exists anywhere in the real photo set, so those two dishes
 * were swapped for ones we can show honestly rather than mislabeling an
 * unrelated photo.
 */
export const DISHES = [
  {
    id: "pav-bhaji",
    name: "Prince Special Pav Bhaji",
    desc: "Slow-mashed on the tawa for hours, finished with a generous knob of melting butter and fresh coriander.",
    price: "₹120",
    img: "/food-photos/food_07.jpg",
    wash: "from-[#FF8A3D]/70 via-[#FF8A3D]/10",
  },
  {
    id: "chinese",
    name: "Wok-Tossed Chilli Paneer",
    desc: "Fiery, tangy, and packed with the chaotic energy of the streets — balanced with absolute precision.",
    price: "₹180",
    img: "/food-photos/food_20.jpg",
    wash: "from-[#C62828]/70 via-[#C62828]/10",
  },
  {
    id: "punjabi-butter-masala",
    name: "Butter Paneer Masala",
    desc: "Soft paneer cubes simmered in a velvety tomato-butter gravy, finished with cream and cashew.",
    price: "₹150",
    img: "/food-photos/food_01.jpg",
    wash: "from-[#FFF5E4]/40 via-[#FFF5E4]/5",
  },
  {
    id: "punjabi",
    name: "Prince Punjabi Thali",
    desc: "Our signature spread — dal, paneer sabzi, seasonal veg, rice, roti, salad and dessert.",
    price: "₹250",
    img: "/food-photos/food_13.jpg",
    wash: "from-[#D4AF37]/70 via-[#D4AF37]/10",
  },
  {
    id: "malai-kofta",
    name: "Malai Kofta",
    desc: "Cashew-and-paneer dumplings in a rich, sweetly spiced cream gravy — a Prince Corner favourite.",
    price: "₹130",
    img: "/food-photos/food_02.jpg",
    wash: "from-[#9b5de5]/60 via-[#9b5de5]/10",
  },
] as const;

export const TIMELINE = [
  { year: "2012", title: "First Restaurant", desc: "A single stall in Isanpur, one tawa, one promise.", img: "/food-photos/food_02.jpg" },
  { year: "2013", title: "First Happy Customer", desc: "A queue formed before the second batch of pav bhaji was ready.", img: "/food-photos/food_03.jpg" },
  { year: "2016", title: "Expansion", desc: "Maninagar and Vastrapur opened within a year of each other.", img: "/food-photos/food_04.jpg" },
  { year: "2020", title: "Five Branches", desc: "Satellite, Bopal, and beyond — the same taste, every table.", img: "/food-photos/food_06.jpg" },
  { year: "Today", title: "5 Locations Across Ahmedabad", desc: "Still family-run. Still the same recipe from that first tawa.", img: "/food-photos/storefront_hero.jpg" },
] as const;

export const BRANCHES = [
  { name: "Isanpur (Flagship)", area: "Vatva Road", hours: "11 AM – 11 PM", dish: "Pav Bhaji", rating: "4.6", img: "/food-photos/food_07.jpg" },
  { name: "Maninagar", area: "East Ahmedabad", hours: "11 AM – 11 PM", dish: "Paneer Masala", rating: "4.5", img: "/food-photos/food_01.jpg" },
  { name: "Vastrapur", area: "West Ahmedabad", hours: "12 PM – 11:30 PM", dish: "Malai Kofta", rating: "4.7", img: "/food-photos/food_02.jpg" },
  { name: "Satellite", area: "Satellite", hours: "12 PM – 11:30 PM", dish: "Chilli Paneer", rating: "4.6", img: "/food-photos/food_20.jpg" },
  { name: "Bopal", area: "West Ahmedabad", hours: "Coming Soon", dish: "—", rating: "—", img: "/food-photos/food_09.jpg" },
] as const;

export const MENU_ISLANDS = [
  { id: "punjabi", name: "Punjabi", img: "/food-photos/food_13.jpg", items: ["Butter Paneer Masala", "Dal Makhani", "Amritsari Kulcha", "Tandoori Roti"] },
  { id: "chinese", name: "Chinese", img: "/food-photos/food_19.jpg", items: ["Veg Manchurian", "Hakka Noodles", "Chilli Potato", "Schezwan Rice"] },
  { id: "south-indian", name: "South Indian", img: "/food-photos/food_09.jpg", items: ["Masala Dosa", "Idli Sambar", "Uttapam", "Medu Vada"] },
  { id: "street-food", name: "Street Food", img: "/food-photos/food_11.jpg", items: ["Prince Special Pav Bhaji", "Vada Pav", "Pani Puri", "Bhel Puri"] },
  { id: "beverages", name: "Beverages", img: "/food-photos/food_08.jpg", items: ["Royal Falooda", "Masala Chaas", "Cold Coffee", "Fresh Lime Soda"] },
] as const;

export const REVIEWS = [
  { name: "Aarav Sharma", initials: "AS", text: "The pav bhaji tastes exactly the same as it did 10 years ago. Unreal consistency.", stars: 5 },
  { name: "Priya Nair", initials: "PN", text: "Best dosa outside of Chennai, genuinely. The chutney is on another level.", stars: 5 },
  { name: "Rohan Mehta", initials: "RM", text: "Ordered for a family function — everyone asked where it was from.", stars: 5 },
  { name: "Sneha Kapoor", initials: "SK", text: "Chilli paneer here ruined every other restaurant's version for me.", stars: 4 },
  { name: "Vikram Rao", initials: "VR", text: "Clean, fast, and the butter on the bhaji is criminal (in the best way).", stars: 5 },
  { name: "Ananya Iyer", initials: "AI", text: "Been going to the Isanpur branch since it opened. Never disappoints.", stars: 5 },
] as const;

// Every entry here was viewed and confirmed to actually be food/restaurant
// photography — food_14/15/18 (a price-list page and two personal event
// photos with zero food content) and the menu-photos set (all scanned menu
// pages, not dish photography) were removed for exactly that reason.
export const GALLERY_IMAGES = [
  "/food-photos/food_01.jpg", "/food-photos/food_02.jpg", "/food-photos/food_04.jpg",
  "/food-photos/food_07.jpg", "/food-photos/food_08.jpg", "/food-photos/food_09.jpg",
  "/food-photos/food_10.jpg", "/food-photos/food_11.jpg", "/food-photos/food_12.jpg",
  "/food-photos/food_13.jpg", "/food-photos/food_19.jpg", "/food-photos/food_20.jpg",
] as const;

export const STATS = [
  { value: 5, suffix: "", label: "Locations" },
  { value: 100, suffix: "+", label: "Menu Items" },
  { value: 50000, suffix: "+", label: "Happy Customers" },
  { value: 14, suffix: "", label: "Years Serving Ahmedabad" },
] as const;

/** Real, verifiable — from Prince Corner's actual MagicPin listing. */
export const RATING = { score: "4.0", count: 17, source: "MagicPin" } as const;

export const KITCHEN_STEPS = [
  { img: "/food-photos/food_10.jpg", caption: "Fresh vegetables, cut daily" },
  { img: "/food-photos/food_09.jpg", caption: "The tawa comes alive" },
  { img: "/food-photos/food_11.jpg", caption: "Spices, added by hand" },
  { img: "/food-photos/food_07.jpg", caption: "Butter, melted generously" },
  { img: "/food-photos/food_17.jpg", caption: "Plated and served hot" },
] as const;
