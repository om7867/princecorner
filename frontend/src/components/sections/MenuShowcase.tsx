"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { PUBLIC_API_BASE_URL } from "@/lib/env";
import { formatMoney } from "@/lib/types";
import type { CategoryDTO, MenuItemDTO } from "@/lib/types";
import { useMediaCapability } from "@/lib/use-media-capability";
import { PhotoDishScene } from "@/components/scenes/PhotoDishScene";
import { Reveal } from "@/components/ui/Reveal";

const DIETARY_LABEL: Record<string, string> = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  "gluten-free": "Gluten-free",
  "contains-nuts": "Contains nuts",
};

export function MenuShowcase({ items: allItems }: { items: MenuItemDTO[] }) {
  const capability = useMediaCapability();
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    fetch(`${PUBLIC_API_BASE_URL}/menu/categories`)
      .then((r) => r.json())
      .then((cats: CategoryDTO[]) => {
        setCategories(cats);
        setActiveCategoryId((cur) => cur ?? cats[0]?.id ?? null);
      })
      .catch(() => {});
  }, []);

  const items = useMemo(
    () => allItems.filter((item) => item.category_id === activeCategoryId),
    [allItems, activeCategoryId]
  );

  const [selectedId, setSelectedId] = useState<string | undefined>(items[0]?.id);
  const selected = items.find((i) => i.id === selectedId) ?? items[0];

  function selectCategory(categoryId: string) {
    setActiveCategoryId(categoryId);
    const first = allItems.find((i) => i.category_id === categoryId);
    setSelectedId(first?.id);
  }

  function handleCardKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = cardRefs.current[(index + 1) % items.length];
      next?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = cardRefs.current[(index - 1 + items.length) % items.length];
      prev?.focus();
    }
  }

  const show3D = capability.ready && capability.canRender3D;

  return (
    <section
      id="menu"
      aria-label="Menu"
      className="relative bg-linen px-6 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="text-center">
            <p className="font-body text-xs uppercase tracking-[0.35em] text-terracotta">
              The Menu
            </p>
            <h2 className="mt-4 text-balance font-display text-4xl italic text-espresso sm:text-5xl">
              Made slow, served warm
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-balance text-espresso/70">
              A short menu, changed with the seasons — every plate finished by
              hand before it reaches your table.
            </p>
          </div>
        </Reveal>

        {/* Category tabs */}
        <div
          role="tablist"
          aria-label="Menu categories"
          className="mt-12 flex flex-wrap items-center justify-center gap-2"
        >
          {categories.map((cat) => {
            const isActive = cat.id === activeCategoryId;
            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => selectCategory(cat.id)}
                className={`rounded-full px-5 py-2 font-body text-sm font-medium tracking-wide transition-all duration-300 ease-[var(--ease-cubic)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${
                  isActive
                    ? "bg-espresso text-linen shadow-md"
                    : "bg-espresso/5 text-espresso/70 hover:bg-espresso/10"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          {/* 3D / static spotlight */}
          <div className="relative mx-auto h-72 w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-b from-espresso-soft to-espresso sm:h-96 lg:mx-0">
            {/* Blurred photo backdrop sets the mood behind the 3D dish */}
            {selected?.photo_url && (
              <Image
                key={selected.id}
                src={selected.photo_url}
                alt=""
                aria-hidden
                fill
                priority
                sizes="(max-width: 640px) 100vw, 448px"
                className="scale-110 object-cover opacity-40 blur-md"
              />
            )}
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,_rgba(231,167,58,0.18),_transparent_65%)]"
            />
            {/* The dish photo itself, floating as a 3D object */}
            {show3D && selected?.photo_url ? (
              <div aria-hidden className="absolute inset-0">
                <PhotoDishScene
                  url={selected.photo_url}
                  reducedMotion={capability.reducedMotion}
                  cameraZ={5.6}
                />
              </div>
            ) : (
              selected?.photo_url && (
                <Image
                  src={selected.photo_url}
                  alt={selected.photo_alt ?? selected.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 448px"
                  className="object-cover"
                />
              )
            )}
            {selected && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-baseline justify-between bg-gradient-to-t from-espresso/80 to-transparent px-6 pb-5 pt-10">
                <span className="font-display text-2xl italic text-linen">
                  {selected.name}
                </span>
                <span className="font-body text-sm font-semibold text-saffron">
                  {formatMoney(selected.base_price)}
                </span>
              </div>
            )}
          </div>

          {/* Accessible, keyboard-navigable item list — this is the real
              interactive surface; the 3D panel is a decorative mirror. */}
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1" role="list">
            {items.map((item, index) => {
              const isSelected = item.id === selected?.id;
              return (
                <li key={item.id}>
                  <button
                    ref={(el) => {
                      cardRefs.current[index] = el;
                    }}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    onFocus={() => setSelectedId(item.id)}
                    onMouseEnter={() => setSelectedId(item.id)}
                    onKeyDown={(e) => handleCardKeyDown(e, index)}
                    aria-pressed={isSelected}
                    className={`w-full rounded-2xl border px-5 py-4 text-left transition-all duration-300 ease-[var(--ease-cubic)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${
                      isSelected
                        ? "border-terracotta bg-terracotta/5 shadow-sm"
                        : "border-espresso/10 hover:border-espresso/25"
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                        {item.photo_url && (
                          <Image
                            src={item.photo_url}
                            alt={item.photo_alt ?? item.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="font-display text-lg text-espresso">
                            {item.name}
                          </span>
                          <span className="shrink-0 font-body text-sm font-semibold text-terracotta">
                            {formatMoney(item.base_price)}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm text-espresso/70">
                          {item.description}
                        </p>
                        {item.dietary_tags.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {item.dietary_tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-sage/10 px-2.5 py-0.5 text-xs font-medium text-sage"
                              >
                                {DIETARY_LABEL[tag]}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
