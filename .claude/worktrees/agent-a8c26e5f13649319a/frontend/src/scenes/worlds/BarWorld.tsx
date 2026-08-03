"use client";

import {
  WoodSurface,
  BackWall,
  BottleShelf,
  CocktailGlass,
  DriftParticles,
  IdleSpin,
} from "@/scenes/core/props";
import type { CameraKeyframe } from "@/scenes/core/types";

/**
 * Bar world: nocturnal lounge. Camera opens close on a lit cocktail, pulls
 * back to reveal the counter, trucks along the glowing back bar, turns to
 * the stage corner, and sinks into a low wide nightcap shot.
 */
export const BAR_KEYFRAMES: CameraKeyframe[] = [
  { at: 0.0, position: [0.5, 1.2, 3.2], lookAt: [0, 0.7, 0], fov: 34 },
  { at: 0.15, position: [0, 1.8, 7], lookAt: [0, 0.8, -2], fov: 38 },
  { at: 0.35, position: [-4.5, 1.9, 4.5], lookAt: [-4.5, 1.6, -6], fov: 34 },
  { at: 0.55, position: [4.5, 1.9, 4.5], lookAt: [4.5, 1.6, -6], fov: 34 },
  { at: 0.75, position: [1.5, 1.5, 6], lookAt: [-6.5, 1.2, -5], fov: 36 },
  { at: 1.0, position: [0, 1.1, 8.5], lookAt: [0, 1.2, -3], fov: 44 },
];

const DRINKS: { x: number; liquid: string }[] = [
  { x: -3.2, liquid: "#c96f2e" },
  { x: -1.6, liquid: "#8fae6b" },
  { x: 0, liquid: "#b0432e" },
  { x: 1.6, liquid: "#d8a13c" },
  { x: 3.2, liquid: "#7a5a8f" },
];

export function BarWorld() {
  return (
    <>
      <fog attach="fog" args={["#0a0c0d", 6, 22]} />
      <ambientLight intensity={0.35} color="#2a3a3e" />
      <directionalLight position={[3, 7, 4]} intensity={0.3} color="#4a6a70" />

      <WoodSurface position={[0, -0.15, 0]} size={[34, 0.3, 18]} color="#1c1512" />
      <BackWall position={[0, 5, -8.5]} size={[44, 16]} color="#0e1214" />

      {/* hero cocktail, rim-lit */}
      <group position={[0, 0, 0]}>
        <IdleSpin speed={0.25}>
          <CocktailGlass scale={1.5} liquid="#c96f2e" />
        </IdleSpin>
        <pointLight position={[0.8, 1.6, 1]} color="#e7a73a" intensity={26} distance={5} decay={2} />
        <pointLight position={[-1, 0.8, -0.5]} color="#3a6a70" intensity={12} distance={4} />
      </group>

      {/* the line of signature cocktails */}
      {DRINKS.map((d, i) =>
        i === 2 ? null : (
          <group key={i} position={[d.x, 0, -0.4]}>
            <CocktailGlass scale={1} liquid={d.liquid} />
          </group>
        )
      )}

      {/* glowing back bar, camera trucks along it */}
      <BottleShelf
        position={[0, 0.9, -6]}
        rows={3}
        cols={14}
        width={11}
        palette={["#3a2a1a", "#5a3a1c", "#2a3a2e", "#4a2418", "#3d3020"]}
      />
      {[-4.5, 0, 4.5].map((x, i) => (
        <pointLight
          key={i}
          position={[x, 3.4, -5]}
          color="#d88a3c"
          intensity={22}
          distance={7}
          decay={2}
        />
      ))}
      {/* front fill so the bottle rows read instead of silhouetting */}
      {[-2.5, 2.5].map((x, i) => (
        <pointLight
          key={`fill-${i}`}
          position={[x, 1.8, -4]}
          color="#c98a4a"
          intensity={18}
          distance={6}
          decay={1.8}
        />
      ))}

      {/* stage corner — warm spotlight for jazz night */}
      <group position={[-6.5, 0, -5]}>
        <mesh castShadow position={[0, 0.5, 0]}>
          <cylinderGeometry args={[1.1, 1.2, 1, 20]} />
          <meshStandardMaterial color="#241a12" roughness={0.85} />
        </mesh>
        <spotLight
          position={[0, 5.5, 2]}
          angle={0.4}
          penumbra={0.6}
          color="#e7a73a"
          intensity={80}
          distance={12}
          castShadow
          target-position={[0, 0.8, 0]}
        />
      </group>

      {/* amber bokeh dust floating through the room */}
      <DriftParticles
        position={[0, 1.5, -2]}
        count={60}
        spread={[14, 4, 6]}
        speed={0.04}
        size={0.05}
        color="#e7a73a"
        opacity={0.35}
        direction="down"
      />
    </>
  );
}
