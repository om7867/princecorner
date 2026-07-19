"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Deterministic PRNG (mulberry32) — stable prop layouts across re-renders. */
function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── Surfaces ──────────────────────────────────────────────────────── */

export function WoodSurface({
  position = [0, 0, 0] as [number, number, number],
  size = [30, 0.3, 16] as [number, number, number],
  color = "#3a2a1c",
}) {
  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.85} metalness={0.05} />
    </mesh>
  );
}

export function BackWall({
  position = [0, 4, -8] as [number, number, number],
  size = [40, 14] as [number, number],
  color = "#241811",
}) {
  return (
    <mesh position={position} receiveShadow>
      <planeGeometry args={size} />
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  );
}

/* ── Light fixtures ────────────────────────────────────────────────── */

export function Candle({
  position = [0, 0, 0] as [number, number, number],
  intensity = 2.2,
}: {
  position?: [number, number, number];
  intensity?: number;
}) {
  const light = useRef<THREE.PointLight>(null);
  const flame = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const flicker =
      1 +
      Math.sin(state.clock.elapsedTime * 9) * 0.08 +
      Math.sin(state.clock.elapsedTime * 23) * 0.05;
    if (light.current) light.current.intensity = intensity * 10 * flicker;
    if (flame.current) flame.current.scale.setScalar(0.9 + flicker * 0.1);
  });
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.09, 0.11, 0.5, 12]} />
        <meshStandardMaterial color="#e8dcc4" roughness={0.6} />
      </mesh>
      <mesh ref={flame} position={[0, 0.62, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#ffca6b" toneMapped={false} />
      </mesh>
      <pointLight
        ref={light}
        position={[0, 0.75, 0]}
        color="#ffb45e"
        intensity={intensity * 10}
        distance={9}
        decay={1.6}
        castShadow
        shadow-mapSize={[512, 512]}
      />
    </group>
  );
}

export function PendantLamp({
  position = [0, 4, 0] as [number, number, number],
  color = "#ffc987",
  intensity = 3,
}: {
  position?: [number, number, number];
  color?: string;
  intensity?: number;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 2.4, 6]} />
        <meshStandardMaterial color="#1a120c" />
      </mesh>
      <mesh castShadow>
        <coneGeometry args={[0.45, 0.5, 24, 1, true]} />
        <meshStandardMaterial color="#2e1e12" roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.12, 0]}>
        <sphereGeometry args={[0.13, 12, 12]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <pointLight
        position={[0, -0.3, 0]}
        color={color}
        intensity={intensity * 10}
        distance={10}
        decay={1.6}
      />
    </group>
  );
}

/* ── Particles: steam, flour dust, bokeh ───────────────────────────── */

export function DriftParticles({
  position = [0, 0, 0] as [number, number, number],
  count = 40,
  spread = [1.2, 2.2, 1.2] as [number, number, number],
  speed = 0.35,
  size = 0.045,
  color = "#f5eee3",
  opacity = 0.5,
  direction = "up" as "up" | "down",
}) {
  const points = useRef<THREE.Points>(null);
  type Sim = {
    seeds: { x: number; y: number; z: number; v: number; w: number }[];
    positions: Float32Array;
  };
  const sim = useRef<Sim | null>(null);

  useFrame((state, delta) => {
    const geo = points.current?.geometry;
    if (!geo) return;
    if (!sim.current || sim.current.seeds.length !== count) {
      const rand = seededRandom(count * 7919 + Math.round(spread[0] * 100));
      sim.current = {
        seeds: Array.from({ length: count }, () => ({
          x: (rand() - 0.5) * spread[0],
          y: rand() * spread[1],
          z: (rand() - 0.5) * spread[2],
          v: 0.5 + rand(),
          w: rand() * Math.PI * 2,
        })),
        positions: new Float32Array(count * 3),
      };
    }
    const { seeds, positions } = sim.current;
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      s.y += delta * speed * s.v * (direction === "up" ? 1 : -0.6);
      if (direction === "up" && s.y > spread[1]) s.y = 0;
      if (direction === "down" && s.y < 0) s.y = spread[1];
      positions[i * 3] =
        s.x + Math.sin(state.clock.elapsedTime * 0.8 + s.w) * 0.12;
      positions[i * 3 + 1] = s.y;
      positions[i * 3 + 2] = s.z;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  });

  return (
    <points ref={points} position={position}>
      <bufferGeometry />
      <pointsMaterial
        color={color}
        size={size}
        transparent
        opacity={opacity}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/* ── Objects ───────────────────────────────────────────────────────── */

export function Plate({
  position = [0, 0, 0] as [number, number, number],
  radius = 0.55,
  color = "#e8dcc4",
}: {
  position?: [number, number, number];
  radius?: number;
  color?: string;
}) {
  return (
    <mesh castShadow receiveShadow position={position}>
      <cylinderGeometry args={[radius, radius * 0.82, 0.07, 32]} />
      <meshStandardMaterial color={color} roughness={0.35} />
    </mesh>
  );
}

export function FoodMound({
  position = [0, 0, 0] as [number, number, number],
  color = "#8a4a26",
  scale = 1,
}: {
  position?: [number, number, number];
  color?: string;
  scale?: number;
}) {
  return (
    <mesh castShadow position={position} scale={[scale, scale * 0.55, scale]}>
      <sphereGeometry args={[0.28, 20, 14]} />
      <meshStandardMaterial color={color} roughness={0.65} flatShading />
    </mesh>
  );
}

export function Bottle({
  position = [0, 0, 0] as [number, number, number],
  height = 1,
  color = "#4a2e18",
}: {
  position?: [number, number, number];
  height?: number;
  color?: string;
}) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.13, 0.14, height, 12]} />
        <meshStandardMaterial color={color} roughness={0.15} metalness={0.25} />
      </mesh>
      <mesh castShadow position={[0, height + 0.14, 0]}>
        <cylinderGeometry args={[0.045, 0.06, 0.32, 8]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.25} />
      </mesh>
    </group>
  );
}

export function BottleShelf({
  position = [0, 0, 0] as [number, number, number],
  rows = 3,
  cols = 8,
  width = 7,
  palette = ["#4a2e18", "#6b3d1f", "#2e3d2a", "#59331d", "#403020"],
}: {
  position?: [number, number, number];
  rows?: number;
  cols?: number;
  width?: number;
  palette?: string[];
}) {
  const bottles = useMemo(() => {
    const rand = seededRandom(rows * 31 + cols * 131);
    const list: { x: number; y: number; h: number; c: string }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        list.push({
          x: (c / (cols - 1) - 0.5) * width + (rand() - 0.5) * 0.15,
          y: r * 1.6,
          h: 0.75 + rand() * 0.45,
          c: palette[Math.floor(rand() * palette.length)],
        });
      }
    }
    return list;
  }, [rows, cols, width, palette]);

  return (
    <group position={position}>
      {Array.from({ length: rows }).map((_, r) => (
        <mesh key={r} receiveShadow castShadow position={[0, r * 1.6 - 0.06, 0]}>
          <boxGeometry args={[width + 0.8, 0.1, 0.9]} />
          <meshStandardMaterial color="#2a1c12" roughness={0.8} />
        </mesh>
      ))}
      {bottles.map((b, i) => (
        <Bottle key={i} position={[b.x, b.y, 0]} height={b.h} color={b.c} />
      ))}
    </group>
  );
}

export function CoffeeCup({
  position = [0, 0, 0] as [number, number, number],
  scale = 1,
  cup = "#f5eee3",
  coffee = "#3a2416",
}: {
  position?: [number, number, number];
  scale?: number;
  cup?: string;
  coffee?: string;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow receiveShadow position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.3, 0.22, 0.44, 24]} />
        <meshStandardMaterial color={cup} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.41, 0]}>
        <cylinderGeometry args={[0.27, 0.27, 0.02, 24]} />
        <meshStandardMaterial color={coffee} roughness={0.25} />
      </mesh>
      <mesh castShadow position={[0.34, 0.22, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.12, 0.035, 8, 16]} />
        <meshStandardMaterial color={cup} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.42, 0.42, 0.04, 24]} />
        <meshStandardMaterial color={cup} roughness={0.35} />
      </mesh>
    </group>
  );
}

export function Loaf({
  position = [0, 0, 0] as [number, number, number],
  scale = 1,
  color = "#b57a3e",
  rotation = 0,
}: {
  position?: [number, number, number];
  scale?: number;
  color?: string;
  rotation?: number;
}) {
  return (
    <mesh
      castShadow
      receiveShadow
      position={position}
      rotation={[0, rotation, 0]}
      scale={[scale * 1.4, scale * 0.62, scale * 0.85]}
    >
      <sphereGeometry args={[0.5, 20, 14]} />
      <meshStandardMaterial color={color} roughness={0.75} flatShading />
    </mesh>
  );
}

export function CocktailGlass({
  position = [0, 0, 0] as [number, number, number],
  scale = 1,
  liquid = "#c96f2e",
}: {
  position?: [number, number, number];
  scale?: number;
  liquid?: string;
}) {
  return (
    <group position={position} scale={scale}>
      {/* coupe bowl */}
      <mesh castShadow position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.34, 0.1, 0.3, 24, 1, true]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.05}
          transmission={0.9}
          thickness={0.3}
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.66, 0]}>
        <cylinderGeometry args={[0.3, 0.12, 0.18, 24]} />
        <meshStandardMaterial
          color={liquid}
          roughness={0.1}
          emissive={liquid}
          emissiveIntensity={0.25}
        />
      </mesh>
      {/* stem + foot */}
      <mesh castShadow position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0.05} transparent opacity={0.5} />
      </mesh>
      <mesh receiveShadow position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.2, 0.22, 0.03, 20]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0.05} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

export function Chair({
  position = [0, 0, 0] as [number, number, number],
  rotation = 0,
  color = "#2a1c12",
}: {
  position?: [number, number, number];
  rotation?: number;
  color?: string;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh castShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[0.75, 0.08, 0.75]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 1.05, -0.34]}>
        <boxGeometry args={[0.75, 0.95, 0.07]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {[
        [-0.3, -0.3],
        [0.3, -0.3],
        [-0.3, 0.3],
        [0.3, 0.3],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.26, z]}>
          <cylinderGeometry args={[0.035, 0.035, 0.52, 6]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/** Slow idle spin wrapper for hero objects. */
export function IdleSpin({
  speed = 0.15,
  children,
}: {
  speed?: number;
  children: React.ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * speed;
  });
  return <group ref={group}>{children}</group>;
}
