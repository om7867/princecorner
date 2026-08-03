import Image from "next/image";
import { unsplash } from "@/lib/unsplash";

const MARQUEE_IMAGES = [
  { src: "/food-photos/paneer_butter_masala.jpg", alt: "Butter Paneer Masala" },
  { src: "/food-photos/real_pav_bhaji.jpg", alt: "Prince Special Pav Bhaji" },
  { src: "/food-photos/masala_dosa.jpg", alt: "Golden Masala Dosa" },
  { src: "/food-photos/dal_makhani.jpg", alt: "Dal Makhani" },
  { src: "/food-photos/punjabi_thali.jpg", alt: "Prince Punjabi Thali" },
  { src: "/food-photos/hakka_noodles.jpg", alt: "Veg Hakka Noodles" },
];

export function ImageMarquee() {
  return (
    <section className="bg-[#0e0b08] py-12 overflow-hidden border-y border-white/5">
      <div className="flex w-max">
        <div className="flex w-max animate-marquee-images gap-6 px-3">
          {MARQUEE_IMAGES.map((img, i) => (
            <div key={i} className="relative h-72 w-[26rem] rounded-2xl overflow-hidden shrink-0 opacity-70 hover:opacity-100 transition-opacity duration-700 ease-[var(--ease-cubic)]">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="400px"
                loading="eager"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <div className="flex w-max animate-marquee-images gap-6 px-3" aria-hidden>
          {MARQUEE_IMAGES.map((img, i) => (
            <div key={`dup-${i}`} className="relative h-72 w-[26rem] rounded-2xl overflow-hidden shrink-0 opacity-70 hover:opacity-100 transition-opacity duration-700 ease-[var(--ease-cubic)]">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="400px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
