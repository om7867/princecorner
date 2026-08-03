"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

const branches = [
  { title: "Isanpur (Flagship)", label: "Open Now", img: "/food-photos/food_01.jpg", desc: "Rameshwar Shopping Center, near Bus Stand, Vatva Road. The original location where our street food legacy began." },
  { title: "Maninagar", label: "Open Now", img: "/food-photos/food_02.jpg", desc: "Serving our famous Pav Bhaji and Pulao to the heart of East Ahmedabad. The exact same uncompromising flavors." },
  { title: "Vastrapur", label: "Open Now", img: "/food-photos/food_03.jpg", desc: "Bringing the authentic Prince Corner taste to West Ahmedabad. A modern space with our classic street energy." },
  { title: "Satellite", label: "Open Now", img: "/food-photos/food_04.jpg", desc: "Our newest outlet serving the Satellite neighborhood. Rapidly expanding our footprint across the city." },
  { title: "Bopal", label: "Coming Soon", img: "/food-photos/food_05.jpg", desc: "Get ready, Bopal. Gujarat's finest street food experience is coming your way." },
];

export function PrinceBranchWheel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const [radius, setRadius] = useState(300);

  useEffect(() => {
    // Set radius dynamically on client
    setRadius(window.innerWidth < 768 ? 220 : 350);

    gsap.registerPlugin(ScrollTrigger);

    // ScrollTrigger to rotate the wheel
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=200%", // Scroll for twice the viewport height
        scrub: 1, // Smooth scrubbing
        pin: true, // Pin the section while scrolling
      }
    });

    // Rotate the wheel a full 360 degrees backwards (so items come from the right)
    tl.to(wheelRef.current, {
      rotationY: -360,
      ease: "none"
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(t => {
        if (t.trigger === containerRef.current) t.kill();
      });
    };
  }, []);

  return (
    <div className="relative w-full">
      <section ref={containerRef} className="relative w-full h-screen bg-[#0e0b08] overflow-hidden flex items-center justify-center">
        
        {/* Background Texture */}
        <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        <div className="mx-auto max-w-7xl w-full flex flex-col lg:flex-row items-center justify-between px-6 lg:px-12 relative z-10">
          
          {/* Left Side: Static Text */}
          <div className="w-full lg:w-1/3 flex flex-col mb-12 lg:mb-0">
            <p className="luxury-paragraph mb-4 font-body text-xs font-bold uppercase tracking-[0.3em] text-[#b71c1c]">
              Our Footprint
            </p>
            <h2 className="luxury-heading font-display text-5xl lg:text-7xl leading-tight font-bold text-white mb-6">
              The Prince <br />
              <span className="text-[#b71c1c]">Empire.</span>
            </h2>
            <p className="luxury-paragraph font-body text-lg text-white/70">
              Scroll to explore our locations. From our flagship stall to our expanding outlets across Gujarat, our commitment to explosive flavors remains identical.
            </p>
          </div>

          {/* Right Side: The Scrubbing Wheel */}
          <div className="w-full lg:w-2/3 h-[50vh] lg:h-[80vh] flex items-center justify-center" style={{ perspective: '2000px' }}>
            <div 
              ref={wheelRef} 
              className="relative w-[220px] h-[320px] md:w-[300px] md:h-[400px]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {branches.map((branch, i) => {
                const angle = i * (360 / branches.length);
                return (
                  <div 
                    key={i} 
                    className="branch-cell absolute top-0 left-0 w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-[#1a1512]"
                    style={{ 
                      transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                      backfaceVisibility: 'hidden'
                    }}
                  >
                    <div className="absolute inset-0 z-0 opacity-40">
                      <Image
                        src={branch.img}
                        alt={branch.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    </div>
                    
                    <div className="relative z-10 h-full flex flex-col justify-end p-6">
                      <span className="bg-[#b71c1c] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-4">
                        {branch.label}
                      </span>
                      <h3 className="font-display text-2xl font-bold text-white mb-2">{branch.title}</h3>
                      <p className="font-body text-sm text-white/70 leading-relaxed">
                        {branch.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
