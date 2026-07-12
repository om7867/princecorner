"use client";

import {
  WoodSurface,
  BackWall,
  DriftParticles,
  CoffeeCup,
  FoodMound,
  Plate,
  IdleSpin,
} from "@/scenes/core/props";
import type { CameraKeyframe } from "@/scenes/core/types";

/**
 * Café world: sunlit morning counter. Camera looks across the counter at a
 * steaming cup, glides forward past the drinks line-up, drifts along the
 * pastry case, and lifts to take in the whole bright room.
 */
export const CAFE_KEYFRAMES: CameraKeyframe[] = [
  { at: 0.0, position: [1.8, 1.5, 6.5], lookAt: [0, 0.7, 0], fov: 38 },
  { at: 0.15, position: [0.4, 1.1, 3.6], lookAt: [0, 0.6, 0], fov: 34 },
  { at: 0.35, position: [-4.4, 1.3, 4], lookAt: [-4.4, 0.55, 0], fov: 34 },
  { at: 0.55, position: [4.4, 1.3, 4], lookAt: [4.4, 0.55, 0], fov: 34 },
  { at: 0.75, position: [1, 1.6, 6], lookAt: [6.5, 0.8, -4.5], fov: 36 },
  { at: 1.0, position: [0, 3.2, 9], lookAt: [0, 0.8, -1], fov: 44 },
];

const CUPS: { x: number; scale: number }[] = [
  { x: -4.4, scale: 1 },
  { x: -2.2, scale: 0.85 },
  { x: 0, scale: 1.15 },
  { x: 2.2, scale: 0.9 },
  { x: 4.4, scale: 1 },
];

export function CafeWorld() {
  return (
    <>
      <fog attach="fog" args={["#efe3cd", 10, 30]} />
      <ambientLight intensity={0.65} color="#fff4e0" />
      {/* morning window light */}
      <directionalLight
        position={[-7, 6, 4]}
        intensity={1.6}
        color="#ffe8c0"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[6, 4, 6]} intensity={0.4} color="#fff" />

      <WoodSurface position={[0, -0.15, 0]} size={[34, 0.3, 18]} color="#caa87a" />
      <BackWall position={[0, 5, -9]} size={[44, 16]} color="#e8d9bd" />

      {/* hero cup with rising steam */}
      <group position={[0, 0, 0]}>
        <IdleSpin speed={0.2}>
          <CoffeeCup scale={1.6} />
        </IdleSpin>
        <DriftParticles
          position={[0, 0.75, 0]}
          count={30}
          spread={[0.5, 1.8, 0.5]}
          speed={0.45}
          color="#ffffff"
          opacity={0.55}
        />
      </group>

      {/* drinks line-up along the counter */}
      {CUPS.map((c, i) =>
        i === 2 ? null : (
          <group key={i} position={[c.x, 0, -0.3]}>
            <CoffeeCup scale={c.scale} coffee={i % 2 ? "#5a3a22" : "#3a2416"} />
          </group>
        )
      )}

      {/* pastry case, camera turns to it late */}
      <group position={[6.5, 0, -4.5]}>
        <mesh castShadow position={[0, 0.8, 0]}>
          <boxGeometry args={[4, 1.6, 1.4]} />
          <meshPhysicalMaterial color="#fff" roughness={0.05} transparent opacity={0.18} />
        </mesh>
        {[-1.4, -0.5, 0.4, 1.3].map((x, i) => (
          <group key={i} position={[x, 0.45, 0]}>
            <Plate radius={0.4} color="#fff" />
            <FoodMound
              position={[0, 0.14, 0]}
              scale={0.7}
              color={["#c98a3e", "#b06a32", "#e3b075", "#8a4a26"][i]}
            />
          </group>
        ))}
        <pointLight position={[0, 2, 1]} color="#fff0d8" intensity={20} distance={7} />
      </group>

      {/* hanging plants (green clusters overhead) */}
      {[-3, 0.5, 4].map((x, i) => (
        <group key={i} position={[x, 4.2, 1.5]}>
          <mesh castShadow>
            <sphereGeometry args={[0.45, 10, 8]} />
            <meshStandardMaterial color="#6b7a4f" roughness={0.9} flatShading />
          </mesh>
          <mesh position={[0.3, -0.3, 0.1]}>
            <sphereGeometry args={[0.28, 8, 6]} />
            <meshStandardMaterial color="#59663f" roughness={0.9} flatShading />
          </mesh>
        </group>
      ))}

      {/* floating dust motes in the window light */}
      <DriftParticles
        position={[-3, 1, 2]}
        count={50}
        spread={[6, 4, 3]}
        speed={0.06}
        size={0.03}
        color="#ffe8c0"
        opacity={0.4}
        direction="down"
      />
    </>
  );
}
