"use client";

import { useEffect, useRef } from "react";

/**
 * Cheap canvas ember/smoke-particle layer — small glowing dots drifting
 * upward with gentle horizontal drift and flicker. Used behind the Hero,
 * Kitchen, and Stats sections instead of a real WebGL smoke sim (no 3D
 * asset/physics budget for this page — see plan's "explicitly not
 * attempted" section).
 */
export function EmberParticles({ color = "#FF8A3D", count = 40 }: { color?: string; count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: height + Math.random() * height,
      r: 0.6 + Math.random() * 1.8,
      speed: 0.15 + Math.random() * 0.35,
      drift: (Math.random() - 0.5) * 0.3,
      flicker: Math.random() * Math.PI * 2,
    }));

    function resize() {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    }
    window.addEventListener("resize", resize);

    function tick() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.y -= p.speed;
        p.x += p.drift;
        p.flicker += 0.03;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        const alpha = 0.25 + Math.sin(p.flicker) * 0.2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.shadowBlur = 6;
        ctx.shadowColor = color;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [color, count]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
    />
  );
}
