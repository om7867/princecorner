import Image from "next/image";
import { unsplash } from "@/lib/unsplash";

const MARQUEE_IMAGES = [
  { src: unsplash("1546069901-ba9599a7e63c", 800), alt: "Fresh vegetarian bowl" },
  { src: unsplash("1512621776951-a57141f2eefd", 800), alt: "Gourmet salad" },
  { src: unsplash("1631515243349-e0cb75fb8d3a", 800), alt: "Vegetarian Thali" },
  { src: unsplash("1585937421612-70a008356fbe", 800), alt: "Paneer dish" },
  { src: unsplash("1473093295043-cdd812d0e601", 800), alt: "Mushroom risotto" },
  { src: unsplash("1565557623262-b51c2513a641", 800), alt: "Smoked paneer" },
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
