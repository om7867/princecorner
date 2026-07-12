"use client";

import { DishModel } from "@/components/scenes/DishModel";
import {
  WoodSurface,
  BackWall,
  Candle,
  PendantLamp,
  DriftParticles,
  Plate,
  FoodMound,
  BottleShelf,
  IdleSpin,
} from "@/scenes/core/props";
import type { CameraKeyframe } from "@/scenes/core/types";

/**
 * Fine-dining world: a long candlelit table. The camera opens high and wide,
 * leans into the hero dish, trucks sideways past the five tasting courses,
 * turns to the fire-lit kitchen pass, drifts to the wine wall, and settles.
 */
export const RESTAURANT_KEYFRAMES: CameraKeyframe[] = [
  { at: 0.0, position: [0, 3.4, 9.5], lookAt: [0, 0.7, 0], fov: 40 },
  { at: 0.12, position: [0.6, 1.9, 5.6], lookAt: [0, 0.7, 0], fov: 36 },
  { at: 0.3, position: [-5.2, 1.5, 4.2], lookAt: [-5.2, 0.6, 0], fov: 34 },
  { at: 0.5, position: [5.2, 1.5, 4.2], lookAt: [5.2, 0.6, 0], fov: 34 },
  { at: 0.66, position: [2.5, 1.8, 6.5], lookAt: [7.5, 1.6, -6], fov: 38 },
  { at: 0.82, position: [-2.5, 2.0, 5.5], lookAt: [-8, 2.2, -6.5], fov: 36 },
  { at: 1.0, position: [0, 2.9, 9], lookAt: [0, 0.8, 0], fov: 42 },
];

const COURSES: { x: number; tone: "warm" | "sage" | "charred" | "cream" }[] = [
  { x: -5.2, tone: "warm" },
  { x: -2.6, tone: "charred" },
  { x: 0, tone: "sage" },
  { x: 2.6, tone: "charred" },
  { x: 5.2, tone: "cream" },
];

export function RestaurantWorld() {
  return (
    <>
      <fog attach="fog" args={["#160f0a", 8, 26]} />
      <ambientLight intensity={0.22} color="#3d2a1a" />
      <directionalLight
        position={[4, 8, 5]}
        intensity={0.35}
        color="#8a6a4a"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* room */}
      <WoodSurface position={[0, -0.15, 0]} size={[34, 0.3, 18]} color="#33241a" />
      <BackWall position={[0, 5, -9]} size={[44, 16]} color="#1c130d" />

      {/* hero dish, center stage */}
      <group position={[0, 0, 0]}>
        <IdleSpin speed={0.12}>
          <DishModel tone="charred" scale={1.5} />
        </IdleSpin>
        <DriftParticles position={[0, 0.7, 0]} count={26} speed={0.28} opacity={0.35} />
      </group>

      {/* the five tasting courses along the table */}
      {COURSES.map((course, i) => (
        <group key={i} position={[course.x, 0, -0.4]}>
          <Plate radius={0.5} position={[0, 0.05, 0]} />
          <FoodMound
            position={[0, 0.2, 0]}
            scale={0.85}
            color={
              course.tone === "sage"
                ? "#6b7a4f"
                : course.tone === "cream"
                  ? "#e3c996"
                  : course.tone === "charred"
                    ? "#4a2c18"
                    : "#b0562e"
            }
          />
        </group>
      ))}

      {/* candles pacing the table */}
      <Candle position={[-3.9, 0, 1.1]} intensity={1.8} />
      <Candle position={[1.3, 0, 1.3]} intensity={2.2} />
      <Candle position={[4.4, 0, 0.9]} intensity={1.6} />

      {/* pendants above */}
      <PendantLamp position={[-2.5, 4.4, -1]} intensity={2.4} />
      <PendantLamp position={[2.5, 4.6, -1]} intensity={2.4} />

      {/* kitchen pass glow, camera turns here mid-journey */}
      <group position={[7.5, 0, -6]}>
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[3.4, 2.4, 0.4]} />
          <meshStandardMaterial color="#241811" roughness={0.9} />
        </mesh>
        <mesh position={[0, 1.1, 0.25]}>
          <planeGeometry args={[2.6, 1.3]} />
          <meshBasicMaterial color="#ff8a3c" toneMapped={false} />
        </mesh>
        <pointLight position={[0, 1.4, 1.2]} color="#ff7a30" intensity={40} distance={9} decay={1.8} />
        <DriftParticles position={[0, 2.4, 0.4]} count={22} speed={0.5} color="#ffb37a" opacity={0.4} />
      </group>

      {/* wine wall, stage left */}
      <BottleShelf position={[-8, 0.7, -6.2]} rows={3} cols={9} width={6} />
      <pointLight position={[-8, 3, -4]} color="#c98a4a" intensity={16} distance={8} />
    </>
  );
}
