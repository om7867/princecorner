"use client";

import {
  Component,
  Suspense,
  useEffect,
  useRef,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, RoundedBox, Sparkles, useTexture } from "@react-three/drei";
import * as THREE from "three";

/**
 * Remote photos load through the Next.js image optimizer so the WebGL
 * texture request is same-origin — direct hits to images.unsplash.com
 * get blocked by ad-blockers/strict networks, which crashed the canvas.
 * Local /public paths pass through untouched.
 */
function textureUrl(url: string): string {
  if (!/^https?:\/\//.test(url)) return url;
  return `/_next/image?url=${encodeURIComponent(url)}&w=828&q=75`;
}

/** If the texture still fails, show the flat photo instead of crashing. */
class SceneErrorBoundary extends Component<
  { fallback: ReactNode; resetKey: string; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.failed) {
      this.setState({ failed: false });
    }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * The real food photo as a 3D object: a thick ceramic-edged card that
 * floats, tilts toward the pointer, and (on venue pages) does a full
 * turn as the user scrolls. The photo is textured on both faces so the
 * card never shows a blank back mid-spin.
 */
function PhotoCard({
  url,
  spinProgress,
  reducedMotion,
}: {
  url: string;
  spinProgress?: MutableRefObject<number>;
  reducedMotion: boolean;
}) {
  const texture = useTexture(textureUrl(url), (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
  });

  const group = useRef<THREE.Group>(null);
  const spawn = useRef(0);

  useEffect(() => {
    spawn.current = 0;
  }, [url]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;

    // scale-in entrance whenever the photo changes
    spawn.current = Math.min(1, spawn.current + delta * 2.4);
    const eased = 1 - Math.pow(1 - spawn.current, 3);
    g.scale.setScalar(THREE.MathUtils.lerp(0.86, 1, eased));

    // resting pose: slightly turned and rolled so the card reads as a 3D
    // object at first glance instead of a flat pasted image
    const REST_YAW = -0.32;
    const REST_ROLL = -0.05;

    if (reducedMotion) {
      g.rotation.set(0.06, REST_YAW, REST_ROLL);
      return;
    }

    const t = state.clock.elapsedTime;
    const scroll = spinProgress ? spinProgress.current * Math.PI * 2 : 0;
    const idleSway = Math.sin(t * 0.5) * 0.12;
    // pointer parallax: the card leans toward the cursor
    const targetX = 0.06 - state.pointer.y * 0.16 + Math.sin(t * 0.7) * 0.03;
    const targetY = REST_YAW + scroll + idleSway + state.pointer.x * 0.22;

    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, targetX, 0.08);
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, targetY, 0.1);
    g.rotation.z = REST_ROLL;
    g.position.y = Math.sin(t * 0.8) * 0.05;
  });

  return (
    <group ref={group}>
      {/* ceramic body gives the photo real thickness */}
      <RoundedBox args={[3.3, 2.5, 0.14]} radius={0.07} castShadow>
        <meshStandardMaterial color="#ece2d1" roughness={0.45} metalness={0.05} />
      </RoundedBox>
      <mesh position={[0, 0, 0.075]}>
        <planeGeometry args={[3.14, 2.34]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.075]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[3.14, 2.34]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function PhotoDishScene({
  url,
  spinProgress,
  reducedMotion,
  sparkles = true,
  cameraZ = 4.4,
}: {
  url: string;
  spinProgress?: MutableRefObject<number>;
  reducedMotion: boolean;
  sparkles?: boolean;
  cameraZ?: number;
}) {
  return (
    <SceneErrorBoundary
      resetKey={url}
      fallback={
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={textureUrl(url)}
          alt=""
          aria-hidden
          className="h-full w-full object-cover"
        />
      }
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.15, cameraZ], fov: 34 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.85} color="#f5eee3" />
          <directionalLight position={[3, 4, 3]} intensity={1.1} color="#e7a73a" />
          <pointLight position={[-3, 1, 2]} intensity={0.4} color="#c1622c" />

          <PhotoCard
            url={url}
            spinProgress={spinProgress}
            reducedMotion={reducedMotion}
          />

          {sparkles && !reducedMotion && (
            <Sparkles
              count={24}
              scale={[4.5, 3.2, 2]}
              size={2}
              speed={0.15}
              opacity={0.35}
              color="#f5eee3"
            />
          )}

          <ContactShadows
            position={[0, -1.7, 0]}
            opacity={0.5}
            scale={7}
            blur={2.6}
            far={2.4}
            color="#2e1e12"
          />
        </Suspense>
      </Canvas>
    </SceneErrorBoundary>
  );
}
