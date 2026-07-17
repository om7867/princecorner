import Image from "next/image";
import { unsplash } from "@/data/menu";
import { Reveal } from "@/components/ui/Reveal";

const GALLERY = [
  {
    src: unsplash("1495474472287-4d71bcdd2085", 600),
    alt: "Friends raising latte cups together at the café counter",
  },
  {
    src: unsplash("1414235077428-338989a2e8c0", 600),
    alt: "A dish plated tableside in warm candlelight",
  },
  {
    src: unsplash("1517433670267-08bbd4be890f", 600),
    alt: "Bakery shelves stacked with fresh pastries",
  },
  {
    src: unsplash("1470337458703-46ad1756a187", 600),
    alt: "A cocktail strained over ice at the bar",
  },
  {
    src: unsplash("1509440159596-0249088772ff", 600),
    alt: "Sourdough loaves dusted with flour",
  },
  {
    src: unsplash("1551024506-0bccd828d307", 600),
    alt: "Chocolate dessert with warm caramel pour",
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
