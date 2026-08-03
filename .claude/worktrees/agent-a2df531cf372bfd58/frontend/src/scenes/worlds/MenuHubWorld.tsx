"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DishModel } from "@/components/scenes/DishModel";
import {
  WoodSurface,
  CocktailGlass,
  CoffeeCup,
  Loaf,
  DriftParticles,
} from "@/scenes/core/props";
import type { CameraKeyframe } from "@/scenes/core/types";

/**
 * Menu hub world: all four venues orbit one table. Dishes ring the center
 * up close, drinks and pastries orbit further out at staggered depths. The
 * camera slowly circles the arrangement as the page scrolls.
 */
export const MENU_KEYFRAMES: CameraKeyframe[] = [
  { at: 0.0, position: [0, 2.6, 8.5], lookAt: [0, 0.6, 0], fov: 40 },
  { at: 0.3, position: [6.2, 2.2, 5.5], lookAt: [0, 0.5, 0], fov: 38 },
  { at: 0.6, position: [7.5, 3.2, -2.5], lookAt: [0, 0.5, 0], fov: 38 },
  { at: 0.85, position: [2.5, 4.5, -7.5], lookAt: [0, 0.4, 0], fov: 40 },
  { at: 1.0, position: [0, 5.8, -8.5], lookAt: [0, 0.3, 0], fov: 44 },
];

const RING_TONES: ("warm" | "sage" | "charred" | "cream")[] = [
  "charred",
  "warm",
  "sage",
  "cream",
  "charred",
  "warm",
];

function OrbitRing() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.06;
  });
  return (
    <group ref={group}>
      {/* inner ring: dishes */}
      {RING_TONES.map((tone, i) => {
        const angle = (i / RING_TONES.length) * Math.PI * 2;
        return (
          <group
            key={`dish-${i}`}
            position={[Math.cos(angle) * 3.2, 0, Math.sin(angle) * 3.2]}
          >
            <DishModel tone={tone} scale={0.75} />
          </group>
        );
      })}
      {/* outer ring: drinks + bakes at staggered heights */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2 + 0.4;
        const x = Math.cos(angle) * 5.6;
        const z = Math.sin(angle) * 5.6;
        const y = 0.25 + (i % 3) * 0.55;
        if (i % 3 === 0)
          return <CocktailGlass key={`o-${i}`} position={[x, y, z]} scale={0.9} liquid={["#c96f2e", "#8fae6b", "#d8a13c"][i % 3]} />;
        if (i % 3 === 1)
          return <CoffeeCup key={`o-${i}`} position={[x, y, z]} scale={0.85} />;
        return <Loaf key={`o-${i}`} position={[x, y + 0.2, z]} scale={0.7} rotation={i} />;
      })}
    </group>
  );
}

export function MenuHubWorld() {
  return (
    <>
      <fog attach="fog" args={["#14100b", 9, 26]} />
      <ambientLight intensity={0.3} color="#4a3620" />
      <directionalLight
        position={[5, 8, 5]}
        intensity={0.8}
        color="#e7a73a"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[0, 4, 0]} color="#ffca6b" intensity={26} distance={14} decay={1.8} />

      <WoodSurface position={[0, -0.2, 0]} size={[30, 0.3, 30]} color="#2a1e14" />

      <OrbitRing />

      <DriftParticles
        position={[0, 2, 0]}
        count={50}
        spread={[12, 4, 12]}
        speed={0.05}
        size={0.04}
        color="#e7a73a"
        opacity={0.3}
        direction="down"
      />
    </>
  );
}
