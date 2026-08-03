"use client";

import { Suspense, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { useMediaCapability } from "@/lib/use-media-capability";
import { usePageScrollProgress } from "./use-page-scroll";
import { CameraRig } from "./CameraRig";
import type { CameraKeyframe } from "./types";

/**
 * The fixed full-viewport WebGL stage every world renders into. DOM content
 * scrolls above it (fastest parallax layer); the camera rig moves through
 * the scene beneath. When WebGL is unavailable or the user prefers reduced
 * motion, the gradient backdrop stands in and the DOM content still works.
 */
export function WorldCanvas({
  keyframes,
  backdrop,
  children,
}: {
  keyframes: CameraKeyframe[];
  /** Tailwind gradient classes painting the world's base atmosphere. */
  backdrop: string;
  children: ReactNode;
}) {
  const capability = useMediaCapability();
  const progress = usePageScrollProgress();

  return (
    <div aria-hidden className={`fixed inset-0 z-0 ${backdrop}`}>
      {capability.ready && capability.canRender3D && (
        <Canvas
          shadows
          dpr={[1, 1.5]}
          camera={{
            position: keyframes[0].position,
            fov: keyframes[0].fov ?? 38,
          }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
        >
          <CameraRig
            keyframes={keyframes}
            progress={progress}
            reducedMotion={capability.reducedMotion}
          />
          <Suspense fallback={null}>{children}</Suspense>
        </Canvas>
      )}
    </div>
  );
}
