"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import Link from "next/link";

const slides = [
  {
    id: "hero",
    title: "Prince Corner",
    subtitle: "Open up your happiness.",
    description: "The street food legacy of Gujarat, redefined for the ultimate premium experience. Simple, honest, and unforgettable.",
    bg: "#0e0b08",
    img: "/food-photos/storefront_hero.jpg",
  },
  {
    id: "punjabi",
    title: "Rich Punjabi",
    subtitle: "Authentic & Buttery.",
    description: "Slow-cooked to perfection, honoring the heritage of North Indian dhabas while presenting them with uncompromised hygiene.",
    bg: "#b71c1c",
    img: "/food-photos/food_01.jpg",
  },
  {
    id: "dosa",
    title: "Golden Dosa",
    subtitle: "Crisp. Authentic.",
    description: "Flawlessly thin, golden-brown crepes filled with a fragrant, spiced potato mash. Locals cross town just for this.",
    bg: "#7f1d1d", // slightly different dark red
    img: "/food-photos/food_05.jpg",
  },
  {
    id: "chinese",
    title: "Wok-Tossed",
    subtitle: "Fiery & Bold.",
    description: "The unmistakable smoky flavor of the wok. Our Indian-Chinese plates are packed with the chaotic energy of the streets.",
    bg: "#450a0a",
    img: "/food-photos/food_12.jpg",
  },
  {
    id: "branches",
    title: "Our Footprint",
    subtitle: "Across Gujarat.",
    description: "From our flagship stall in Isanpur to Maninagar. We are rapidly expanding our footprint to bring happiness closer to you.",
    bg: "#000000",
    img: "/food-photos/food_20.jpg",
  },
];

export function PrinceCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);

  const numItems = slides.length;
  const theta = 360 / numItems;
  const radius = 450; // Increased radius for better spacing

  useEffect(() => {
    // Initial setup of 3D positions
    const cells = gsap.utils.toArray(".carousel-cell") as HTMLElement[];
    gsap.set(cells, {
      rotationY: (i) => i * theta,
      z: radius,
      transformOrigin: "50% 50% 0",
    });

    // We start at index 0, so background is slides[0].bg
    gsap.set(bgRef.current, { backgroundColor: slides[0].bg });
  }, [theta, radius]);

  // Handle Wheel Scroll
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (isAnimating.current) return;

      const direction = Math.sign(e.deltaY); // 1 for down/next, -1 for up/prev
      if (direction === 0) return;

      let nextIndex = activeIndex + direction;
      
      // Allow infinite looping
      if (nextIndex >= numItems) nextIndex = 0;
      if (nextIndex < 0) nextIndex = numItems - 1;

      goToSlide(nextIndex, direction);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [activeIndex, numItems]);

  const goToSlide = (nextIndex: number, direction: number) => {
    isAnimating.current = true;
    setActiveIndex(nextIndex);

    // 1. Rotate the carousel
    // Calculate the shortest rotation path
    // We want the carousel to rotate such that cell 'nextIndex' faces front (rotationY = -nextIndex * theta)
    // To allow infinite spinning, we just increment or decrement current rotation
    const currentRotation = gsap.getProperty(carouselRef.current, "rotationY") as number || 0;
    const targetRotation = currentRotation - (direction * theta);

    gsap.to(carouselRef.current, {
      rotationY: targetRotation,
      duration: 1.2,
      ease: "power3.inOut",
    });

    // 2. Animate Background Color
    gsap.to(bgRef.current, {
      backgroundColor: slides[nextIndex].bg,
      duration: 1.2,
      ease: "power2.inOut",
    });

    // 3. Animate Text (Fade out, update, fade in)
    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating.current = false;
      }
    });

    const textElements = textRef.current?.children;
    if (textElements) {
      tl.to(textElements, {
        y: -20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.in",
      })
      .set(textElements, { y: 20 })
      // Notice: React state will update the text content concurrently, 
      // but GSAP will just fade it back in smoothly.
      .to(textElements, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
      });
    } else {
      setTimeout(() => { isAnimating.current = false; }, 1200);
    }
  };

  const currentSlide = slides[activeIndex];

  return (
    <div className="relative h-screen w-full overflow-hidden text-white font-body selection:bg-white/30">
      {/* Dynamic Background */}
      <div ref={bgRef} className="absolute inset-0 z-0 transition-colors duration-1000" />
      
      {/* Grain / Noise Overlay for texture */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Top Navbar / Logo Area */}
      <header className="absolute top-0 left-0 w-full z-50 p-8 flex justify-between items-start">
        <Link href="/" className="font-body text-xs font-bold uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors">
          &larr; Back to Home
        </Link>
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 md:w-40 md:h-40 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            {/* The user-provided logo */}
            <Image 
              src="/logo.jpeg" 
              alt="Prince Corner Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        <Link href="/menu" className="font-body text-xs font-bold uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors">
          View Menu
        </Link>
      </header>

      {/* Main Content Layout */}
      <div className="absolute inset-0 z-10 flex flex-col lg:flex-row items-center justify-between px-6 lg:px-24">
        
        {/* Left Side: Dynamic Text */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center mt-40 lg:mt-0 pointer-events-none z-20">
          <div ref={textRef} className="flex flex-col max-w-xl">
            <p className="luxury-paragraph text-xs font-bold uppercase tracking-[0.4em] text-white/60 mb-6">
              {currentSlide.subtitle}
            </p>
            <h1 className="luxury-heading font-display text-5xl sm:text-7xl lg:text-[6rem] leading-[1.1] text-white font-bold drop-shadow-lg mb-8">
              {currentSlide.title}
            </h1>
            <p className="luxury-paragraph font-body text-lg md:text-xl leading-relaxed text-white/80 border-l-2 border-white/20 pl-6">
              {currentSlide.description}
            </p>
          </div>
        </div>

        {/* Right Side: 3D Carousel */}
        <div className="w-full lg:w-1/2 h-[50vh] lg:h-screen flex items-center justify-center relative" style={{ perspective: '1500px' }}>
          <div 
            ref={carouselRef} 
            className="relative w-[280px] h-[380px] md:w-[350px] md:h-[480px] transition-transform"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {slides.map((slide, i) => {
              const isActive = i === activeIndex;
              return (
                <div 
                  key={slide.id} 
                  className={`carousel-cell absolute top-0 left-0 w-full h-full rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 transition-all duration-1000 ${isActive ? 'opacity-100 shadow-[0_0_80px_rgba(255,255,255,0.2)]' : 'opacity-40 grayscale-[30%]'}`}
                >
                  <Image
                    src={slide.img}
                    alt={slide.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Scroll Instruction */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-50 pointer-events-none opacity-60 animate-pulse">
        <div className="w-[1px] h-12 bg-gradient-to-b from-transparent to-white" />
        <span className="font-body text-[10px] uppercase tracking-[0.4em] text-white">Scroll to Explore</span>
      </div>

    </div>
  );
}
