export type DietaryTag = "vegetarian" | "vegan" | "gluten-free" | "contains-nuts";

export type CategoryDTO = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export type VariantDTO = {
  id: string;
  name: string;
  price: string;
  is_default: boolean;
  sort_order: number;
};

export type AddonDTO = {
  id: string;
  name: string;
  price: string;
  is_available: boolean;
  sort_order: number;
};

export type MenuItemDTO = {
  id: string;
  category_id: string;
  name: string;
  description: string;
  base_price: string;
  dietary_tags: DietaryTag[];
  model_tone: "warm" | "sage" | "charred" | "cream";
  photo_url: string | null;
  photo_alt: string | null;
  is_available: boolean;
  is_active: boolean;
  sort_order: number;
  variants: VariantDTO[];
  addons: AddonDTO[];
};

export type TableDTO = {
  id: string;
  code: string;
  is_active: boolean;
};

export type OrderStatus = "received" | "preparing" | "ready" | "served" | "cancelled";

export type OrderItemAddonDTO = {
  name_snapshot: string;
  price_snapshot: string;
};

export type OrderItemDTO = {
  id: string;
  name_snapshot: string;
  unit_price_snapshot: string;
  quantity: number;
  line_total: string;
  addons: OrderItemAddonDTO[];
};

export type OrderDTO = {
  id: string;
  display_code: string;
  status: OrderStatus;
  note: string;
  subtotal: string;
  total: string;
  created_at: string;
  updated_at: string;
  items: OrderItemDTO[];
  table_code: string;
  is_billed: boolean;
  channel: "dine_in" | "online";
};

export type ReservationStatus = "pending" | "confirmed" | "cancelled";

export type ReservationDTO = {
  id: string;
  reference_code: string;
  name: string;
  phone: string;
  party_size: number;
  date: string;
  time: string;
  note: string;
  status: ReservationStatus;
  created_at: string;
};

export type HoursEntry = { days: string; time: string };

export type SiteSettingsDTO = {
  name: string;
  restaurant_slug: string;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string | null;
  accent_color: string | null;
  address_street: string | null;
  address_area: string | null;
  address_city: string | null;
  maps_query: string | null;
  phone: string | null;
  whatsapp: string | null;
  whatsapp_greeting: string | null;
  email: string | null;
  hours: HoursEntry[];
  timeslots: string[];
  announcement_enabled: boolean;
  announcement_text: string | null;
  announcement_href: string | null;
  announcement_label: string | null;
  tax_rate: string;
  loyalty_points_per_currency: string;
  loyalty_redeem_rate: string;
  hidden_pages: string[];
  razorpay_enabled: boolean;
  razorpay_key_id: string | null;
};

/** The public-site destinations an owner can toggle live/unlive from Admin > Pages. */
export const TOGGLEABLE_PAGES = [
  { slug: "prince-corner", label: "Prince's Corner", href: "/prince-corner" },
  { slug: "restaurant", label: "Restaurant", href: "/restaurant" },
  { slug: "cafe", label: "Café", href: "/cafe" },
  { slug: "bar", label: "Bar", href: "/bar" },
  { slug: "bakery", label: "Bakery", href: "/bakery" },
  { slug: "menu", label: "Menu", href: "/menu" },
] as const;

export function formatMoney(value: string | number): string {
  return `₹${Number(value).toFixed(2)}`;
}

// ── Billing ────────────────────────────────────────────────────────────

export type PaymentMethod = "cash" | "card" | "upi" | "razorpay";
export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

export type PaymentDTO = {
  id: string;
  method: PaymentMethod;
  amount: string;
  status: PaymentStatus;
  created_at: string;
};

export type InvoiceStatus = "unpaid" | "partial" | "paid" | "refunded";

export type InvoiceDTO = {
  id: string;
  table_code: string;
  subtotal: string;
  coupon_code: string | null;
  discount_amount: string;
  loyalty_redeemed_amount: string;
  loyalty_phone: string | null;
  tax_rate: string;
  tax_amount: string;
  total: string;
  status: InvoiceStatus;
  created_at: string;
  orders: OrderDTO[];
  payments: PaymentDTO[];
  amount_paid: string;
};

// ── Coupons & loyalty ────────────────────────────────────────────────────

export type CouponType = "flat" | "percentage" | "bogo";

export type CouponDTO = {
  id: string;
  code: string;
  type: CouponType;
  value: string;
  min_order_amount: string;
  max_discount: string | null;
  starts_at: string | null;
  expires_at: string | null;
  usage_limit: number | null;
  times_used: number;
  is_active: boolean;
};

export type LoyaltyAccountDTO = {
  id: string;
  phone: string;
  name: string | null;
  points: number;
  created_at: string;
};

// ── Inventory ────────────────────────────────────────────────────────────

export type SupplierDTO = {
  id: string;
  name: string;
  contact_phone: string | null;
  contact_email: string | null;
};

export type IngredientDTO = {
  id: string;
  name: string;
  unit: string;
  stock_quantity: string;
  low_stock_threshold: string;
  supplier_id: string | null;
  is_low_stock: boolean;
};

export type RecipeLineDTO = {
  id: string;
  ingredient_id: string;
  ingredient_name: string;
  unit: string;
  quantity_per_serving: string;
};

// ── Analytics ────────────────────────────────────────────────────────────

// ── Platform (platform_owner only) ──────────────────────────────────────

export type OrganizationStatus = "trial" | "active" | "suspended";
export type OrganizationPlan = "trial" | "starter" | "pro" | "enterprise";

export type OrganizationDTO = {
  id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
  plan: OrganizationPlan;
  access_ends_at: string | null;
  created_at: string;
  branch_count: number;
};

export type AnalyticsSummaryDTO = {
  today_revenue: string;
  today_order_count: number;
  average_order_value: string;
  pending_order_count: number;
  low_stock_count: number;
  revenue_series: { date: string; revenue: string; order_count: number }[];
  top_items: { name: string; quantity: number; revenue: string }[];
  orders_by_hour: { hour: number; order_count: number }[];
};
