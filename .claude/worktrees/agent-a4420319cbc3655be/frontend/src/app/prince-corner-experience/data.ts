export const DISHES = [
  {
    id: "pav-bhaji",
    name: "Prince Special Pav Bhaji",
    desc: "Slow-mashed on the tawa for hours, finished with a generous knob of melting butter and fresh coriander.",
    price: "₹120",
    img: "/food-photos/food_01.jpg",
    wash: "from-[#FF8A3D]/70 via-[#FF8A3D]/10",
  },
  {
    id: "chinese",
    name: "Wok-Tossed Chilli Paneer",
    desc: "Fiery, tangy, and packed with the chaotic energy of the streets — balanced with absolute precision.",
    price: "₹180",
    img: "/food-photos/food_12.jpg",
    wash: "from-[#C62828]/70 via-[#C62828]/10",
  },
  {
    id: "south-indian",
    name: "Golden Masala Dosa",
    desc: "Paper-thin, flawlessly crisp, served with piping-hot sambar and fresh coconut chutney.",
    price: "₹110",
    img: "/food-photos/food_05.jpg",
    wash: "from-[#FFF5E4]/40 via-[#FFF5E4]/5",
  },
  {
    id: "pizza",
    name: "Tandoori Paneer Pizza",
    desc: "A wood-fired crust carrying the same bold Prince Corner spice, reimagined.",
    price: "₹240",
    img: "/food-photos/food_08.jpg",
    wash: "from-[#D4AF37]/70 via-[#D4AF37]/10",
  },
  {
    id: "dessert",
    name: "Royal Falooda",
    desc: "Layers of rose syrup, vermicelli, basil seeds, and a scoop of kulfi — a sweet finish to the story.",
    price: "₹150",
    img: "/food-photos/food_16.jpg",
    wash: "from-[#9b5de5]/60 via-[#9b5de5]/10",
  },
] as const;

export const TIMELINE = [
  { year: "2012", title: "First Restaurant", desc: "A single stall in Isanpur, one tawa, one promise.", img: "/food-photos/food_02.jpg" },
  { year: "2013", title: "First Happy Customer", desc: "A queue formed before the second batch of pav bhaji was ready.", img: "/food-photos/food_03.jpg" },
  { year: "2016", title: "Expansion", desc: "Maninagar and Vastrapur opened within a year of each other.", img: "/food-photos/food_04.jpg" },
  { year: "2020", title: "Five Branches", desc: "Satellite, Bopal, and beyond — the same taste, every table.", img: "/food-photos/food_06.jpg" },
  { year: "Today", title: "11+ Branches Across Ahmedabad", desc: "Still family-run. Still the same recipe from that first tawa.", img: "/food-photos/storefront_hero.jpg" },
] as const;

export const BRANCHES = [
  { name: "Isanpur (Flagship)", area: "Vatva Road", hours: "11 AM – 11 PM", dish: "Pav Bhaji", rating: "4.6", img: "/food-photos/food_01.jpg" },
  { name: "Maninagar", area: "East Ahmedabad", hours: "11 AM – 11 PM", dish: "Pulao", rating: "4.5", img: "/food-photos/food_02.jpg" },
  { name: "Vastrapur", area: "West Ahmedabad", hours: "12 PM – 11:30 PM", dish: "Dosa", rating: "4.7", img: "/food-photos/food_03.jpg" },
  { name: "Satellite", area: "Satellite", hours: "12 PM – 11:30 PM", dish: "Chilli Paneer", rating: "4.6", img: "/food-photos/food_04.jpg" },
  { name: "Bopal", area: "West Ahmedabad", hours: "Coming Soon", dish: "—", rating: "—", img: "/food-photos/food_05.jpg" },
] as const;

export const MENU_ISLANDS = [
  { id: "punjabi", name: "Punjabi", img: "/menu-photos/menu_01.jpg", items: ["Butter Paneer Masala", "Dal Makhani", "Amritsari Kulcha", "Tandoori Roti"] },
  { id: "chinese", name: "Chinese", img: "/menu-photos/menu_05.jpg", items: ["Veg Manchurian", "Hakka Noodles", "Chilli Potato", "Schezwan Rice"] },
  { id: "south-indian", name: "South Indian", img: "/menu-photos/menu_09.jpg", items: ["Masala Dosa", "Idli Sambar", "Uttapam", "Medu Vada"] },
  { id: "pizza", name: "Pizza", img: "/menu-photos/menu_12.jpg", items: ["Margherita", "Tandoori Paneer", "Corn & Cheese", "Farmhouse"] },
  { id: "beverages", name: "Beverages", img: "/menu-photos/menu_16.jpg", items: ["Royal Falooda", "Masala Chaas", "Cold Coffee", "Fresh Lime Soda"] },
] as const;

export const REVIEWS = [
  { name: "Aarav Sharma", initials: "AS", text: "The pav bhaji tastes exactly the same as it did 10 years ago. Unreal consistency.", stars: 5 },
  { name: "Priya Nair", initials: "PN", text: "Best dosa outside of Chennai, genuinely. The chutney is on another level.", stars: 5 },
  { name: "Rohan Mehta", initials: "RM", text: "Ordered for a family function — everyone asked where it was from.", stars: 5 },
  { name: "Sneha Kapoor", initials: "SK", text: "Chilli paneer here ruined every other restaurant's version for me.", stars: 4 },
  { name: "Vikram Rao", initials: "VR", text: "Clean, fast, and the butter on the bhaji is criminal (in the best way).", stars: 5 },
  { name: "Ananya Iyer", initials: "AI", text: "Been going to the Isanpur branch since it opened. Never disappoints.", stars: 5 },
] as const;

export const GALLERY_IMAGES = [
  "/food-photos/food_07.jpg", "/food-photos/food_09.jpg", "/food-photos/food_10.jpg",
  "/food-photos/food_11.jpg", "/food-photos/food_13.jpg", "/food-photos/food_14.jpg",
  "/food-photos/food_15.jpg", "/food-photos/food_17.jpg", "/food-photos/food_18.jpg",
  "/food-photos/food_19.jpg", "/menu-photos/menu_03.jpg", "/menu-photos/menu_07.jpg",
] as const;

export const STATS = [
  { value: 11, suffix: "+", label: "Branches" },
  { value: 100, suffix: "+", label: "Menu Items" },
  { value: 50000, suffix: "+", label: "Happy Customers" },
  { value: 12, suffix: "", label: "Years Serving Ahmedabad" },
] as const;

export const KITCHEN_STEPS = [
  { img: "/food-photos/food_02.jpg", caption: "Fresh vegetables, cut daily" },
  { img: "/food-photos/food_09.jpg", caption: "The tawa comes alive" },
  { img: "/food-photos/food_11.jpg", caption: "Spices, added by hand" },
  { img: "/food-photos/food_14.jpg", caption: "Butter, melted generously" },
  { img: "/food-photos/food_17.jpg", caption: "Plated and served hot" },
] as const;

export const INGREDIENTS = [
  { name: "Tomatoes", img: "/food-photos/food_07.jpg" },
  { name: "Butter", img: "/food-photos/food_14.jpg" },
  { name: "Onions", img: "/food-photos/food_09.jpg" },
  { name: "Capsicum", img: "/food-photos/food_10.jpg" },
  { name: "Masala", img: "/food-photos/food_11.jpg" },
  { name: "Garlic", img: "/food-photos/food_13.jpg" },
  { name: "Coriander", img: "/food-photos/food_15.jpg" },
  { name: "Cheese", img: "/food-photos/food_18.jpg" },
] as const;
