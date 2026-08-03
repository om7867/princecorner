"use client";

import {
  WoodSurface,
  BackWall,
  Candle,
  PendantLamp,
  Plate,
  Chair,
  DriftParticles,
} from "@/scenes/core/props";
import type { CameraKeyframe } from "@/scenes/core/types";

/**
 * Reserve world: a set table waiting for you. Calm by design — the camera
 * settles gently from an establishing shot to a seat-level frame and holds,
 * so the form stays the hero. Place settings appear as party size grows,
 * and a soft glow bloom marks a confirmed booking.
 */
export const RESERVE_KEYFRAMES: CameraKeyframe[] = [
  { at: 0.0, position: [0, 2.8, 8], lookAt: [0, 0.7, 0], fov: 40 },
  { at: 0.4, position: [-1.2, 1.7, 5.5], lookAt: [0, 0.7, 0], fov: 36 },
  { at: 1.0, position: [0.8, 1.5, 5], lookAt: [0, 0.75, 0], fov: 36 },
];

/** Seat positions around the round table, in fill order. */
const SEATS: { pos: [number, number, number]; rot: number }[] = [
  { pos: [0, 0.9, 1.15], rot: 0 },
  { pos: [0, 0.9, -1.15], rot: Math.PI },
  { pos: [1.15, 0.9, 0], rot: Math.PI / 2 },
  { pos: [-1.15, 0.9, 0], rot: -Math.PI / 2 },
  { pos: [0.85, 0.9, 0.85], rot: Math.PI / 4 },
  { pos: [-0.85, 0.9, -0.85], rot: -Math.PI * 0.75 },
  { pos: [-0.85, 0.9, 0.85], rot: -Math.PI / 4 },
  { pos: [0.85, 0.9, -0.85], rot: Math.PI * 0.75 },
];

export function ReserveWorld({
  partySize = 2,
  confirmed = false,
}: {
  partySize?: number;
  confirmed?: boolean;
}) {
  const seats = SEATS.slice(0, Math.min(Math.max(partySize, 1), 8));

  return (
    <>
      <fog attach="fog" args={["#160f0a", 7, 24]} />
      <ambientLight intensity={0.2} color="#3d2a1a" />
      <directionalLight position={[4, 7, 5]} intensity={0.3} color="#8a6a4a" castShadow />

      <WoodSurface position={[0, -0.8, 0]} size={[30, 0.3, 18]} color="#2a1c12" />
      <BackWall position={[0, 4.5, -8]} size={[40, 15]} color="#1a110b" />

      {/* the round table */}
      <group position={[0, 0, 0]}>
        <mesh castShadow receiveShadow position={[0, 0.75, 0]}>
          <cylinderGeometry args={[1.7, 1.7, 0.1, 36]} />
          <meshStandardMaterial color="#3a2a1c" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.14, 0.2, 0.85, 12]} />
          <meshStandardMaterial color="#241811" roughness={0.8} />
        </mesh>
        {/* linen runner */}
        <mesh receiveShadow position={[0, 0.81, 0]}>
          <boxGeometry args={[3.1, 0.015, 0.9]} />
          <meshStandardMaterial color="#e8dcc4" roughness={0.85} />
        </mesh>

        {/* place settings appear as the party grows */}
        {seats.map((seat, i) => (
          <Plate key={i} position={seat.pos} radius={0.32} />
        ))}

        {/* the candle — brightens when the booking confirms */}
        <Candle position={[0, 0.8, 0]} intensity={confirmed ? 5 : 2} />
        {confirmed && (
          <>
            <pointLight position={[0, 2, 1]} color="#ffd98a" intensity={40} distance={9} decay={1.8} />
            <DriftParticles
              position={[0, 1.1, 0]}
              count={60}
              spread={[2.6, 2.4, 2.6]}
              speed={0.5}
              size={0.05}
              color="#ffd98a"
              opacity={0.8}
            />
          </>
        )}
      </group>

      {/* two chairs pulled up (always staged, like the room is ready) —
          angled off-axis so they never block the hero copy */}
      <Chair position={[2.1, 0, 1.4]} rotation={Math.PI * 0.75} />
      <Chair position={[-2.1, 0, -1.4]} rotation={-Math.PI * 0.25} />

      <PendantLamp position={[0, 4.2, 0]} intensity={2.6} />
      <DriftParticles position={[0, 1.4, 0]} count={20} speed={0.2} opacity={0.25} />
    </>
  );
}
