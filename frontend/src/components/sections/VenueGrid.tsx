"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const ALL_11_PRINCE_BRANCHES = [
  {
    slug: "prince-corner-isanpur",
    name: "Isanpur (Flagship Main HQ)",
    area: "South Ahmedabad",
    address: "I G P House, Vatva Road, Isanpur",
    tagline: "Our original flagship kitchen with live tawa Pav Bhaji & Punjabi thalis.",
    image: "/food-photos/storefront_hero.jpg",
    rating: "4.0 ★",
    isHQ: true,
    lat: 22.9754,
    lng: 72.5930,
  },
  {
    slug: "prince-corner-maninagar",
    name: "Maninagar",
    area: "South Ahmedabad",
    address: "Maninagar Char Rasta, Rambaug Road, Maninagar",
    tagline: "Vibrant dining hub serving hot paper-thin dosas & royal falooda.",
    image: "/food-photos/food_03.jpg",
    rating: "4.2 ★",
    lat: 23.0039,
    lng: 72.6010,
  },
  {
    slug: "prince-corner-jodhpur",
    name: "Jodhpur Cross Road",
    area: "West Ahmedabad",
    address: "Near Bileshwar Mahadev Mandir Rd, Jodhpur",
    tagline: "Popular western hub famous for tawa pulao, sizzlers & cold lassi.",
    image: "/food-photos/food_04.jpg",
    rating: "3.9 ★",
    lat: 23.0234,
    lng: 72.5298,
  },
  {
    slug: "prince-corner-satellite",
    name: "Satellite",
    area: "West Ahmedabad",
    address: "Satellite Road, Opp Jodhpur Gam, Satellite",
    tagline: "Premium family dining restaurant with full Punjabi thali spreads.",
    image: "/food-photos/food_11.jpg",
    rating: "4.1 ★",
    lat: 23.0305,
    lng: 72.5186,
  },
  {
    slug: "prince-corner-vastrapur",
    name: "Vastrapur (Mansi Circle)",
    area: "West Ahmedabad",
    address: "Near Mansi Circle, Vastrapur Lake Road",
    tagline: "Lakeside food joint famous for wok-tossed Chinese & street chaat.",
    image: "/food-photos/food_05.jpg",
    rating: "3.8 ★",
    lat: 23.0375,
    lng: 72.5312,
  },
  {
    slug: "prince-corner-bopal-south",
    name: "South Bopal",
    area: "South-West Ahmedabad",
    address: "Bopal-Ghuma Main Road, South Bopal",
    tagline: "Spacious multi-level dining serving sizzlers & live dosa options.",
    image: "/food-photos/food_06.jpg",
    rating: "3.8 ★",
    lat: 23.0245,
    lng: 72.4630,
  },
  {
    slug: "prince-corner-bopal-north",
    name: "North Bopal (SP Ring Rd)",
    area: "South-West Ahmedabad",
    address: "SP Ring Road Junction, Bopal",
    tagline: "High-speed takeaway & quick service tawa counter for road trips.",
    image: "/food-photos/food_07.jpg",
    rating: "4.0 ★",
    lat: 23.0450,
    lng: 72.4680,
  },
  {
    slug: "prince-corner-gota",
    name: "Vaishnodevi Circle / Gota",
    area: "North Ahmedabad",
    address: "Sarkhej - Gandhinagar Hwy, Vaishnodevi Circle, Gota",
    tagline: "Northern hub offering full menu dine-in, takeaway & party catering.",
    image: "/food-photos/food_08.jpg",
    rating: "4.1 ★",
    lat: 23.1120,
    lng: 72.5450,
  },
  {
    slug: "prince-corner-nikol",
    name: "Nikolgram Road",
    area: "East Ahmedabad",
    address: "Nikolgram Road, Nikol, East Ahmedabad",
    tagline: "Classic Gujarati favorite for crisp dosas, samosas & faloodas.",
    image: "/food-photos/food_09.jpg",
    rating: "4.1 ★",
    lat: 23.0450,
    lng: 72.6650,
  },
  {
    slug: "prince-corner-nikol-ringroad",
    name: "Nikol SP Ring Road",
    area: "East Ahmedabad",
    address: "SP Ring Road Cross Road, Nikol",
    tagline: "Express drive-through & delivery outlet for fresh tawa preparations.",
    image: "/food-photos/food_12.jpg",
    rating: "4.0 ★",
    lat: 23.0550,
    lng: 72.6780,
  },
  {
    slug: "prince-corner-isanpur-2",
    name: "Isanpur 2nd Outlet (Vatva Rd)",
    area: "South Ahmedabad",
    address: "Near Rameshwar Shopping Center, Vatva Road, Isanpur",
    tagline: "Dedicated express takeaway branch for fast home delivery orders.",
    image: "/food-photos/real_pav_bhaji.jpg",
    rating: "4.2 ★",
    lat: 22.9760,
    lng: 72.5940,
  },
];

function calcDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const HOMEPAGE_AREAS = [
  "All 11 Outlets",
  "South Ahmedabad",
  "West Ahmedabad",
  "South-West Ahmedabad",
  "East Ahmedabad",
  "North Ahmedabad",
];

export function VenueGrid({ hiddenPages = [] }: { hiddenPages?: string[] }) {
  const containerRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [selectedArea, setSelectedArea] = useState("All 11 Outlets");
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocating(false);
        // Fallback to Ahmedabad center if denied
        setUserPos({ lat: 23.0225, lng: 72.5714 });
      }
    );
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".outlets-fade-up",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: containerRef.current, start: "top 80%" },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const amount = direction === "left" ? -380 : 380;
    carouselRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  const filteredOutlets = ALL_11_PRINCE_BRANCHES.filter((b) =>
    selectedArea === "All 11 Outlets" ? true : b.area === selectedArea
  )
    .map((b) => {
      const distance = userPos
        ? calcDistanceKm(userPos.lat, userPos.lng, b.lat, b.lng)
        : null;
      return { ...b, distance };
    })
    .sort((a, b) => {
      if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
      return 0;
    });

  return (
    <section
      id="branches"
      ref={containerRef}
      aria-label="Prince Corner Outlets"
      className="bg-[#0e0b08] py-20 sm:py-28 overflow-hidden text-linen border-t border-white/10"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="outlets-fade-up flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.35em] text-saffron border border-saffron/30 rounded-full px-4 py-1 bg-saffron/10 mb-3">
              <span className="w-2 h-2 rounded-full bg-saffron animate-pulse" />
              <span>Our Footprint Across Ahmedabad</span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl italic text-linen">
              11 Outlets. One Signature Taste.
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-end">
            <button
              onClick={handleLocateMe}
              disabled={locating}
              className="inline-flex items-center gap-2 rounded-full border border-saffron/40 bg-saffron/15 px-5 py-2.5 font-body text-xs uppercase tracking-widest font-bold text-saffron hover:bg-saffron hover:text-espresso transition-all duration-300 shadow-md"
            >
              <span>{locating ? "Locating..." : userPos ? "📍 Recalculate Distance" : "📍 Find Nearest Outlet to Me"}</span>
            </button>

            <Link
              href="/outlets"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 font-body text-xs uppercase tracking-widest font-bold text-linen hover:bg-white/10 transition-all duration-300"
            >
              <span>View All 11 Outlets Page ➔</span>
            </Link>
          </div>
        </div>

        {/* Region Filter Bar */}
        <div className="outlets-fade-up flex overflow-x-auto gap-2.5 pb-4 mb-8 no-scrollbar">
          {HOMEPAGE_AREAS.map((area) => {
            const isActive = selectedArea === area;
            return (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={`shrink-0 font-body text-xs font-bold uppercase tracking-[0.15em] px-5 py-2.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-saffron text-espresso shadow-[0_0_18px_rgba(231,167,58,0.35)] scale-105"
                    : "bg-white/5 text-linen/70 hover:text-linen hover:bg-white/10 border border-white/10"
                }`}
              >
                {area}
              </button>
            );
          })}
        </div>

        {/* Slider Navigation Bar */}
        <div className="outlets-fade-up flex items-center justify-between mb-6">
          <p className="text-xs text-saffron font-bold uppercase tracking-widest">
            {userPos ? "Sorted by Proximity to You" : `Showing ${filteredOutlets.length} Outlets in ${selectedArea}`}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => scroll("left")}
              aria-label="Previous outlets"
              className="w-10 h-10 rounded-full border border-white/15 bg-white/5 hover:bg-saffron hover:text-espresso hover:border-saffron flex items-center justify-center text-linen transition-all duration-300 active:scale-95"
            >
              ◀
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Next outlets"
              className="w-10 h-10 rounded-full border border-white/15 bg-white/5 hover:bg-saffron hover:text-espresso hover:border-saffron flex items-center justify-center text-linen transition-all duration-300 active:scale-95"
            >
              ▶
            </button>
          </div>
        </div>

        {/* INTERACTIVE 11-OUTLET CAROUSEL SLIDER */}
        <div
          ref={carouselRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-6 sm:pb-8 pt-2 no-scrollbar scroll-smooth -mx-1 px-1"
        >
          {filteredOutlets.map((branch, index) => (
            <div
              key={branch.slug}
              className="outlets-fade-up snap-start shrink-0 w-[270px] sm:w-[360px] rounded-[1.6rem] sm:rounded-[2.2rem] border border-white/10 bg-[#14100b] overflow-hidden shadow-xl transition-all duration-500 hover:border-saffron/50 hover:shadow-[0_10px_35px_rgba(0,0,0,0.8)] group flex flex-col justify-between"
            >
              {/* Photo Header */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-black/40">
                <Image
                  src={branch.image}
                  alt={branch.name}
                  fill
                  sizes="360px"
                  className="object-cover transition-transform duration-700 ease-[var(--ease-cubic)] group-hover:scale-105"
                  priority={index < 3}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14100b] via-transparent to-transparent opacity-80" />

                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-[#0e0b08]/85 border border-white/20 backdrop-blur-md rounded-full px-3 py-1 font-body text-xs font-bold text-linen shadow-lg">
                  {branch.rating}
                </div>

                {/* Outlet Number / Distance Tag */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-saffron/15 border border-saffron/40 text-saffron backdrop-blur-md rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                    {branch.isHQ ? "Flagship HQ" : `Outlet 0${index + 1}`}
                  </span>
                  {branch.distance !== null && (
                    <span className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 backdrop-blur-md rounded-full px-2.5 py-1 text-[10px] font-bold">
                      📍 {branch.distance} km away
                    </span>
                  )}
                </div>
              </div>

              {/* Outlet Info */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-saffron">
                    {branch.area}
                  </span>

                  <h3 className="font-display text-2xl italic text-linen group-hover:text-saffron transition-colors duration-300 mt-1">
                    {branch.name}
                  </h3>

                  <p className="mt-2 text-xs text-linen/75 font-body line-clamp-2">
                    {branch.address}
                  </p>

                  <p className="mt-1 text-[11px] text-linen/50 font-light italic line-clamp-2">
                    {branch.tagline}
                  </p>
                </div>

                {/* Action CTA */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-linen/50">
                    Live Preparation
                  </span>

                  <Link
                    href={`/order?table=ONLINE&r=${branch.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-saffron hover:text-linen transition-colors"
                  >
                    <span>Order Direct</span>
                    <span>➔</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}




