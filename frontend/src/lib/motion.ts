/** Shared motion tokens — mirrors the durations/easing defined in globals.css. */
export const EASE_CUBIC = "cubic-bezier(0.65, 0, 0.35, 1)" as const;
export const EASE_CUBIC_ARRAY: [number, number, number, number] = [
  0.65, 0, 0.35, 1,
];

export const DURATION = {
  micro: 0.5,
  section: 1.0,
} as const;

export const SECTIONS = [
  { id: "hero", label: "Welcome" },
  { id: "menu", label: "Menu" },
  { id: "spaces", label: "Our Spaces" },
  { id: "story", label: "Our Story" },
  { id: "gallery", label: "Gallery" },
  { id: "reviews", label: "Reviews" },
  { id: "reservation", label: "Reserve" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];
