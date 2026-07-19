"use client";

import { useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CameraKeyframe } from "./types";

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * The choreography engine: interpolates the camera along a keyframe path as
 * the page scrolls — dolly, truck, pan and FOV shifts through real 3D space.
 * Every world shares this; only the keyframe config differs. A light damping
 * pass smooths fast scroll flicks, and the pointer adds a subtle parallax
 * drift so the scene feels alive even when scroll is idle.
 */
export function CameraRig({
  keyframes,
  progress,
  reducedMotion,
}: {
  keyframes: CameraKeyframe[];
  progress: MutableRefObject<number>;
  reducedMotion: boolean;
}) {
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());
  const currentLook = useRef(new THREE.Vector3());
  const targetFov = useRef(38);
  const initialized = useRef(false);

  useFrame((state, delta) => {
    const t = reducedMotion ? 0 : progress.current;

    // find the active segment
    let i = 0;
    while (i < keyframes.length - 2 && t > keyframes[i + 1].at) i++;
    const a = keyframes[i];
    const b = keyframes[Math.min(i + 1, keyframes.length - 1)];
    const span = Math.max(b.at - a.at, 0.0001);
    const local = easeInOutCubic(Math.min(1, Math.max(0, (t - a.at) / span)));

    targetPos.current.set(
      THREE.MathUtils.lerp(a.position[0], b.position[0], local),
      THREE.MathUtils.lerp(a.position[1], b.position[1], local),
      THREE.MathUtils.lerp(a.position[2], b.position[2], local)
    );
    targetLook.current.set(
      THREE.MathUtils.lerp(a.lookAt[0], b.lookAt[0], local),
      THREE.MathUtils.lerp(a.lookAt[1], b.lookAt[1], local),
      THREE.MathUtils.lerp(a.lookAt[2], b.lookAt[2], local)
    );
    targetFov.current = THREE.MathUtils.lerp(a.fov ?? 38, b.fov ?? 38, local);

    // pointer parallax drift (skipped for reduced motion)
    if (!reducedMotion) {
      targetPos.current.x += state.pointer.x * 0.35;
      targetPos.current.y += state.pointer.y * 0.18;
    }

    // damped follow — smooths scroll flicks into cinematic moves
    const damp = initialized.current ? 1 - Math.pow(0.0015, delta) : 1;
    initialized.current = true;

    const cam = state.camera as THREE.PerspectiveCamera;
    cam.position.lerp(targetPos.current, damp);
    currentLook.current.lerp(targetLook.current, damp);
    cam.lookAt(currentLook.current);
    cam.fov = THREE.MathUtils.lerp(cam.fov, targetFov.current, damp);
    cam.updateProjectionMatrix();
  });

  return null;
}
