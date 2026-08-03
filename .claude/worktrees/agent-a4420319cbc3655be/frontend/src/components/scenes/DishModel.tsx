"use client";

import { useMemo } from "react";
import type { ModelTone } from "@/data/venues";

const TONE_COLORS: Record<ModelTone, string> = {
  warm: "#c1622c",
  sage: "#6b7a4f",
  charred: "#2e1e12",
  cream: "#e7a73a",
};

/**
 * Procedural stand-in for a photogrammetry-scanned dish. Every instance
 * (hero centerpiece, menu carousel card) renders the same plate + food
 * silhouette so swapping in real .glb models later only means replacing
 * this one component.
 */
export function DishModel({
  tone = "warm",
  scale = 1,
}: {
  tone?: ModelTone;
  scale?: number;
}) {
  const foodColor = TONE_COLORS[tone];

  const foodGeometry = useMemo(() => {
    switch (tone) {
      case "sage":
        return "cluster" as const;
      case "charred":
        return "block" as const;
      case "cream":
        return "dome" as const;
      default:
        return "mound" as const;
    }
  }, [tone]);

  return (
    <group scale={scale}>
      {/* plate base */}
      <mesh position={[0, -0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.95, 1, 0.08, 48]} />
        <meshStandardMaterial color="#f5eee3" roughness={0.35} metalness={0.05} />
      </mesh>
      {/* plate rim */}
      <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <torusGeometry args={[0.88, 0.035, 16, 64]} />
        <meshStandardMaterial color="#ece2d1" roughness={0.4} metalness={0.05} />
      </mesh>

      {foodGeometry === "mound" && (
        <mesh position={[0, 0.14, 0]} castShadow>
          <icosahedronGeometry args={[0.42, 1]} />
          <meshStandardMaterial color={foodColor} roughness={0.6} flatShading />
        </mesh>
      )}

      {foodGeometry === "block" && (
        <mesh position={[0, 0.14, 0]} rotation={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.62, 0.28, 0.4]} />
          <meshStandardMaterial color={foodColor} roughness={0.75} flatShading />
        </mesh>
      )}

      {foodGeometry === "dome" && (
        <mesh position={[0, 0.12, 0]} castShadow>
          <sphereGeometry args={[0.4, 24, 16, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
          <meshStandardMaterial color={foodColor} roughness={0.3} metalness={0.1} />
        </mesh>
      )}

      {foodGeometry === "cluster" &&
        [
          [0, 0.1, 0],
          [0.22, 0.16, 0.12],
          [-0.2, 0.14, -0.1],
          [0.05, 0.2, -0.2],
        ].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]} castShadow>
            <sphereGeometry args={[0.16 - i * 0.015, 12, 10]} />
            <meshStandardMaterial color={foodColor} roughness={0.7} flatShading />
          </mesh>
        ))}

      {/* garnish fleck */}
      <mesh position={[0.28, 0.22, 0.18]} rotation={[0.4, 0.2, 0.1]}>
        <coneGeometry args={[0.04, 0.14, 6]} />
        <meshStandardMaterial color="#6b7a4f" roughness={0.8} flatShading />
      </mesh>
    </group>
  );
}
