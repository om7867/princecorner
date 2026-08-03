/**
 * Camera choreography contract — each world defines its journey as keyframes
 * mapped to page-scroll progress (0 → 1). Building a new world's camera path
 * is a config, not a rewrite.
 */
export type CameraKeyframe = {
  /** Page scroll progress 0–1 where this shot is fully framed. */
  at: number;
  position: [number, number, number];
  lookAt: [number, number, number];
  fov?: number;
};

export type WorldPalette = {
  /** CSS gradient classes for the fixed backdrop behind (and fallback for) the canvas. */
  backdrop: string;
  /** Scene fog / clear color. */
  fog: string;
  /** Key light color. */
  key: string;
  /** Accent hex for nav pill + transition tint. */
  accent: string;
};
