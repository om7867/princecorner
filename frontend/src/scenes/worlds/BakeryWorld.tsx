"use client";

import {
  WoodSurface,
  BackWall,
  DriftParticles,
  Loaf,
  Plate,
  FoodMound,
  IdleSpin,
} from "@/scenes/core/props";
import type { CameraKeyframe } from "@/scenes/core/types";

/**
 * Bakery world: flour-dusted morning counter. Camera floats just above the
 * boards, drifts along the day's bake, peers into the warm oven mouth, and
 * rises for a soft golden wide shot.
 */
export const BAKERY_KEYFRAMES: CameraKeyframe[] = [
  { at: 0.0, position: [0.8, 1.6, 5.8], lookAt: [0, 0.5, 0], fov: 38 },
  { at: 0.15, position: [0, 1.0, 3.4], lookAt: [0, 0.45, 0], fov: 34 },
  { at: 0.35, position: [-4.2, 1.2, 3.8], lookAt: [-4.2, 0.4, 0], fov: 34 },
  { at: 0.55, position: [4.2, 1.2, 3.8], lookAt: [4.2, 0.4, 0], fov: 34 },
  { at: 0.75, position: [1.5, 1.4, 5.5], lookAt: [6.8, 1.1, -5], fov: 36 },
  { at: 1.0, position: [0, 3.0, 8.5], lookAt: [0, 0.6, -0.5], fov: 44 },
];

const BAKE_LINE: { x: number; color: string; scale: number }[] = [
  { x: -4.2, color: "#b57a3e", scale: 1 },
  { x: -2.1, color: "#8a5a2e", scale: 0.85 },
  { x: 2.1, color: "#c98a4a", scale: 0.9 },
  { x: 4.2, color: "#a06432", scale: 1.05 },
];

export function BakeryWorld() {
  return (
    <>
      <fog attach="fog" args={["#efe0c4", 9, 28]} />
      <ambientLight intensity={0.55} color="#fff2da" />
      {/* window light from stage right */}
      <directionalLight
        position={[7, 6, 4]}
        intensity={1.5}
        color="#ffdfa8"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      <WoodSurface position={[0, -0.15, 0]} size={[34, 0.3, 18]} color="#c09a68" />
      <BackWall position={[0, 5, -9]} size={[44, 16]} color="#e3d0ab" />

      {/* hero loaf on a board, flour dust drifting down */}
      <group position={[0, 0, 0]}>
        <mesh receiveShadow position={[0, 0.03, 0]}>
          <cylinderGeometry args={[1.1, 1.1, 0.08, 28]} />
          <meshStandardMaterial color="#9a7346" roughness={0.9} />
        </mesh>
        <IdleSpin speed={0.15}>
          <Loaf position={[0, 0.4, 0]} scale={1.15} />
        </IdleSpin>
        <DriftParticles
          position={[0, 1.6, 0]}
          count={45}
          spread={[2, 1.6, 1.6]}
          speed={0.12}
          size={0.028}
          color="#fff6e6"
          opacity={0.6}
          direction="down"
        />
      </group>

      {/* the day's bake along the counter */}
      {BAKE_LINE.map((b, i) => (
        <Loaf
          key={i}
          position={[b.x, 0.28, -0.35]}
          scale={b.scale * 0.8}
          color={b.color}
          rotation={i * 1.2}
        />
      ))}

      {/* tarts on plates between loaves */}
      {[-3.1, 3.1].map((x, i) => (
        <group key={i} position={[x, 0, 0.5]}>
          <Plate radius={0.38} color="#f5eee3" />
          <FoodMound position={[0, 0.13, 0]} scale={0.6} color={i ? "#8a4a26" : "#c94f4f"} />
        </group>
      ))}

      {/* oven mouth, warm ember glow — camera peers in late */}
      <group position={[6.8, 0, -5]}>
        <mesh castShadow position={[0, 1.3, 0]}>
          <boxGeometry args={[3.6, 2.6, 1.2]} />
          <meshStandardMaterial color="#7a5a3a" roughness={0.9} />
        </mesh>
        <mesh position={[0, 1.05, 0.62]}>
          <planeGeometry args={[1.7, 1]} />
          <meshBasicMaterial color="#ff9a45" toneMapped={false} />
        </mesh>
        <pointLight position={[0, 1.2, 1.6]} color="#ff8a3c" intensity={35} distance={8} decay={1.8} />
      </group>
    </>
  );
}
