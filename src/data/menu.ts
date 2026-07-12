export type DietaryTag = "vegetarian" | "vegan" | "gluten-free" | "contains-nuts";

export type MenuCategory = "starters" | "mains" | "drinks" | "desserts";

export type MenuItem = {
  id: string;
  category: MenuCategory;
  name: string;
  description: string;
  price: string;
  dietary: DietaryTag[];
  /** Low-poly plate "signature" — drives the procedural 3D stand-in until real .glb models are ready. */
  modelTone: "warm" | "sage" | "charred" | "cream";
  photo: { src: string; alt: string };
};

/** Curated Unsplash food photography (all URLs verified live). */
export function unsplash(id: string, w = 800): string {
  return `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;
}

export const CATEGORIES: { id: MenuCategory; label: string }[] = [
  { id: "starters", label: "Starters" },
  { id: "mains", label: "Mains" },
  { id: "drinks", label: "Drinks" },
  { id: "desserts", label: "Desserts" },
];

/**
 * Placeholder menu content. Swap for a real CMS feed or API route —
 * the shape (MenuItem[]) is the only contract the 3D carousel and
 * accessible list view depend on.
 */
export const MENU_ITEMS: MenuItem[] = [
  {
    id: "charred-octopus",
    category: "starters",
    name: "Charred Octopus",
    description: "Slow-braised octopus, smoked paprika oil, charred lemon, sea salt.",
    price: "$18",
    dietary: ["gluten-free"],
    modelTone: "charred",
    photo: {
      src: unsplash("1504674900247-0877df9cc836"),
      alt: "Charred octopus plated with smoked paprika oil and herbs",
    },
  },
  {
    id: "burrata-fig",
    category: "starters",
    name: "Burrata & Fig",
    description: "Hand-torn burrata, roasted fig, aged balsamic, toasted walnut.",
    price: "$16",
    dietary: ["vegetarian", "contains-nuts"],
    modelTone: "cream",
    photo: {
      src: unsplash("1546069901-ba9599a7e63c"),
      alt: "Fresh burrata and fig salad bowl with greens",
    },
  },
  {
    id: "sourdough-board",
    category: "starters",
    name: "Sourdough Board",
    description: "Our 3-day levain, whipped cultured butter, olive oil, sea salt flake.",
    price: "$12",
    dietary: ["vegetarian"],
    modelTone: "warm",
    photo: {
      src: unsplash("1509440159596-0249088772ff"),
      alt: "Rustic sourdough loaves fresh from the oven",
    },
  },
  {
    id: "slow-roasted-lamb",
    category: "mains",
    name: "Slow-Roasted Lamb Shoulder",
    description: "Eight-hour lamb, rosemary jus, charred carrot, sage butter.",
    price: "$34",
    dietary: ["gluten-free"],
    modelTone: "charred",
    photo: {
      src: unsplash("1544025162-d76694265947"),
      alt: "Slow-roasted lamb shoulder on a wooden serving board",
    },
  },
  {
    id: "wild-mushroom-risotto",
    category: "mains",
    name: "Wild Mushroom Risotto",
    description: "Arborio rice, foraged mushrooms, aged parmesan, black truffle oil.",
    price: "$26",
    dietary: ["vegetarian", "gluten-free"],
    modelTone: "sage",
    photo: {
      src: unsplash("1512621776951-a57141f2eefd"),
      alt: "Creamy wild mushroom risotto bowl with fresh vegetables",
    },
  },
  {
    id: "seared-catch",
    category: "mains",
    name: "Seared Catch of the Day",
    description: "Market fish, brown butter, capers, charred lemon, herb oil.",
    price: "$31",
    dietary: ["gluten-free"],
    modelTone: "warm",
    photo: {
      src: unsplash("1414235077428-338989a2e8c0"),
      alt: "Seared fish of the day plated at a candlelit table",
    },
  },
  {
    id: "hand-poured-espresso",
    category: "drinks",
    name: "Hand-Poured Espresso",
    description: "Single origin, roasted in-house, notes of stone fruit and cocoa.",
    price: "$4",
    dietary: ["vegan"],
    modelTone: "charred",
    photo: {
      src: unsplash("1509042239860-f550ce710b93"),
      alt: "Hand-poured espresso with latte art",
    },
  },
  {
    id: "smoked-old-fashioned",
    category: "drinks",
    name: "Smoked Old Fashioned",
    description: "Bourbon, demerara, aromatic bitters, applewood smoke.",
    price: "$15",
    dietary: [],
    modelTone: "warm",
    photo: {
      src: unsplash("1470337458703-46ad1756a187"),
      alt: "Smoked old fashioned cocktail being poured over ice",
    },
  },
  {
    id: "sage-garden-fizz",
    category: "drinks",
    name: "Sage Garden Fizz",
    description: "Gin, garden sage, elderflower, soda, citrus oil.",
    price: "$13",
    dietary: ["vegan"],
    modelTone: "sage",
    photo: {
      src: unsplash("1551538827-9c037cb4f32a"),
      alt: "Sage garden fizz cocktail with fresh herbs and lime",
    },
  },
  {
    id: "olive-oil-cake",
    category: "desserts",
    name: "Olive Oil Cake",
    description: "Citrus-soaked crumb, saffron cream, candied orange.",
    price: "$11",
    dietary: ["vegetarian"],
    modelTone: "cream",
    photo: {
      src: unsplash("1567620905732-2d1ec7ab7445"),
      alt: "Golden olive oil cake stack with saffron syrup",
    },
  },
  {
    id: "dark-chocolate-tart",
    category: "desserts",
    name: "Dark Chocolate Tart",
    description: "70% single-origin ganache, espresso crust, sea salt.",
    price: "$12",
    dietary: ["vegetarian", "contains-nuts"],
    modelTone: "charred",
    photo: {
      src: unsplash("1551024506-0bccd828d307"),
      alt: "Dark chocolate tart with warm caramel pour",
    },
  },
  {
    id: "honey-panna-cotta",
    category: "desserts",
    name: "Honey Panna Cotta",
    description: "Wildflower honey, vanilla bean, toasted almond, orange zest.",
    price: "$10",
    dietary: ["vegetarian", "gluten-free", "contains-nuts"],
    modelTone: "cream",
    photo: {
      src: unsplash("1488477181946-6428a0291777"),
      alt: "Honey panna cotta topped with fresh strawberries",
    },
  },
];
