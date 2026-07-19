"use client";

import { useEffect, useState } from "react";

export type MediaCapability = {
  /** Still resolving on first client render — callers should render nothing 3D-dependent yet. */
  ready: boolean;
  /** User has `prefers-reduced-motion: reduce` set at the OS/browser level. */
  reducedMotion: boolean;
  /** Browser can create a WebGL2 (or WebGL1 fallback) context at all. */
  webglSupported: boolean;
  /** Combined signal: should we render the full 3D experience for this visitor? */
  canRender3D: boolean;
};

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

/**
 * Single source of truth for "can/should this visitor see the 3D experience".
 * Runs once on mount (both checks require the DOM), so every scene and the
 * page shell should gate on `ready` before trusting the other flags —
 * otherwise SSR/first-paint would flash the wrong variant.
 */
export function useMediaCapability(): MediaCapability {
  const [state, setState] = useState<MediaCapability>({
    ready: false,
    reducedMotion: false,
    webglSupported: true,
    canRender3D: true,
  });

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const webglSupported = detectWebGL();

    const update = () => {
      const reducedMotion = mql.matches;
      setState({
        ready: true,
        reducedMotion,
        webglSupported,
        canRender3D: webglSupported && !reducedMotion,
      });
    };

    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return state;
}
