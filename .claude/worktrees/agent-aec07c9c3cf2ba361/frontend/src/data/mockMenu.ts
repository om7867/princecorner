import type { CategoryDTO, MenuItemDTO } from "@/lib/types";

export const MOCK_CATEGORIES: CategoryDTO[] = [
  { id: "cat-1", name: "Signature Indian", slug: "signature-indian", sort_order: 1 },
  { id: "cat-2", name: "Global Comfort", slug: "global-comfort", sort_order: 2 },
  { id: "cat-3", name: "Desserts", slug: "desserts", sort_order: 3 },
];

export const MOCK_MENU_ITEMS: MenuItemDTO[] = [
  {
    id: "item-1",
    category_id: "cat-1",
    name: "Truffle Pav Bhaji",
    description: "Our signature Mumbai street-food classic, elevated with black truffle shavings, slow-cooked heirloom tomatoes, and buttery brioche pav.",
    base_price: "24.00",
    is_available: true,
    photo_url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=1000&auto=format&fit=crop",
    photo_alt: "Gourmet Pav Bhaji",
    dietary_tags: ["vegetarian"],
    sort_order: 1,
    model_tone: "warm",
    is_active: true,
    variants: [],
    addons: []
  },
  {
    id: "item-2",
    category_id: "cat-1",
    name: "Smoked Paneer Tikka",
    description: "Cottage cheese marinated in saffron and hung curd, smoked over applewood embers and served with mint chutney emulsion.",
    base_price: "22.00",
    is_available: true,
    photo_url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1000&auto=format&fit=crop",
    photo_alt: "Smoked Paneer Tikka",
    dietary_tags: ["vegetarian", "gluten-free"],
    sort_order: 2,
    model_tone: "charred",
    is_active: true,
    variants: [],
    addons: []
  },
  {
    id: "item-3",
    category_id: "cat-2",
    name: "Wild Mushroom Risotto",
    description: "Arborio rice slow-cooked with a medley of wild forest mushrooms, finished with aged vegetarian parmesan and truffle oil.",
    base_price: "28.00",
    is_available: true,
    photo_url: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=1000&auto=format&fit=crop",
    photo_alt: "Wild Mushroom Risotto",
    dietary_tags: ["vegetarian", "gluten-free"],
    sort_order: 1,
    model_tone: "sage",
    is_active: true,
    variants: [],
    addons: []
  },
  {
    id: "item-4",
    category_id: "cat-3",
    name: "Dark Chocolate Tart",
    description: "Single-origin dark chocolate ganache in a crisp pastry shell, served with sea salt and espresso crema.",
    base_price: "14.00",
    is_available: true,
    photo_url: "https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=1000&auto=format&fit=crop",
    photo_alt: "Dark Chocolate Tart",
    dietary_tags: ["vegetarian"],
    sort_order: 1,
    model_tone: "cream",
    is_active: true,
    variants: [],
    addons: []
  }
];
