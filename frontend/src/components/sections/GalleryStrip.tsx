import Image from "next/image";
import { unsplash } from "@/lib/unsplash";
import { Reveal } from "@/components/ui/Reveal";

const GALLERY = [
  {
    src: "/food-photos/paneer_butter_masala.jpg",
    alt: "Butter Paneer Masala in handi",
  },
  {
    src: "/food-photos/punjabi_thali.jpg",
    alt: "Prince Special Punjabi Thali Feast",
  },
  {
    src: "/food-photos/masala_dosa.jpg",
    alt: "Golden Masala Dosa with sambar",
  },
  {
    src: "/food-photos/real_pav_bhaji.jpg",
    alt: "Prince Special Pav Bhaji with buttered pav",
  },
  {
    src: "/food-photos/hakka_noodles.jpg",
    alt: "Wok-tossed Hakka Noodles",
  },
  {
    src: "/food-photos/food_16.jpg",
    alt: "Royal Special Falooda with kulfi",
  },
];

export function GalleryStrip() {
  return (
    <section
      id="gallery"
      aria-label="Gallery"
      className="bg-linen px-6 py-24"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="text-center">
            <p className="font-body text-xs uppercase tracking-[0.35em] text-terracotta">
              Moments
            </p>
            <h2 className="mt-4 text-balance font-display text-4xl italic text-espresso">
              From our table
            </h2>
          </div>
        </Reveal>
        <Reveal stagger>
        <ul
          role="list"
          className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
        >
          {GALLERY.map((photo, i) => (
            <li
              key={photo.src}
              className={`relative overflow-hidden rounded-2xl ${
                i % 2 === 0 ? "aspect-[3/4]" : "aspect-[3/4] sm:mt-8"
              }`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover transition-transform duration-700 ease-[var(--ease-cubic)] hover:scale-105"
              />
            </li>
          ))}
        </ul>
        </Reveal>
      </div>
    </section>
  );
}
