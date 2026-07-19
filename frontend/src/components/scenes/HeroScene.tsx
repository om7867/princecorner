"use client";

import { Suspense, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { DishModel } from "./DishModel";
import type { ModelTone } from "@/data/venues";

// The dish sits low in the frame (a table glimpsed below the fold) so it
// never competes with the headline for the eye. The camera's look-at target
// is fixed well above the dish's own world position — intentionally NOT
// tracking it — otherwise the dish would always re-center itself in the
// viewport regardless of how far down we push it.
const DISH_Y = -2.6;
const LOOK_AT_Y = 0.15;

function CameraRig({ progress }: { progress: MutableRefObject<number> }) {
  useFrame(({ camera }) => {
    const p = progress.current;
    camera.position.z = THREE.MathUtils.lerp(7.5, 4.8, p);
    camera.position.y = THREE.MathUtils.lerp(2.4, 1.5, p);
    camera.lookAt(0, LOOK_AT_Y, 0);
  });
  return null;
}

function IdleDish({
  reducedMotion,
  tone,
  progress,
  spinWithScroll,
}: {
  reducedMotion: boolean;
  tone: ModelTone;
  progress: MutableRefObject<number>;
  spinWithScroll: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const idleSpin = useRef(0);
  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    if (!reducedMotion) idleSpin.current += delta * 0.18;
    // Scroll owns most of the rotation on venue pages — the dish turns a
    // full revolution over the hero's scroll range, so scrubbing back and
    // forth "handles" the 3D item.
    const scrollSpin = spinWithScroll ? progress.current * Math.PI * 2 : 0;
    g.rotation.y = idleSpin.current + scrollSpin;
  });
  return (
    <group ref={group} position={[0, DISH_Y, 0]}>
      <DishModel tone={tone} scale={1.15} />
    </group>
  );
}

export function HeroScene({
  progress,
  reducedMotion,
  tone = "warm",
  spinWithScroll = false,
}: {
  progress: MutableRefObject<number>;
  reducedMotion: boolean;
  tone?: ModelTone;
  spinWithScroll?: boolean;
}) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 2.1, 7.5], fov: 32 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <Suspense fallback={null}>
        <CameraRig progress={progress} />
        <ambientLight intensity={0.65} color="#f5eee3" />
        <directionalLight
          position={[3, 5, 2]}
          intensity={1.5}
          color="#e7a73a"
        />
        <pointLight position={[-3, 1.5, -2]} intensity={0.5} color="#c1622c" />

        <IdleDish
          reducedMotion={reducedMotion}
          tone={tone}
          progress={progress}
          spinWithScroll={spinWithScroll}
        />

        {!reducedMotion && (
          <Sparkles
            count={36}
            scale={[2, 2.6, 2]}
            size={2.2}
            speed={0.15}
            opacity={0.3}
            color="#f5eee3"
            position={[0, DISH_Y + 0.7, 0]}
          />
        )}

        <ContactShadows
          position={[0, DISH_Y - 0.63, 0]}
          opacity={0.55}
          scale={6}
          blur={2.4}
          far={2}
          color="#2e1e12"
        />
      </Suspense>
    </Canvas>
  );
}
