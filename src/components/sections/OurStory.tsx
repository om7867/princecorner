import Image from "next/image";
import { unsplash } from "@/data/menu";

const STATS = [
  { value: "2019", label: "The year our first levain was fed" },
  { value: "4", label: "Rooms under one roof" },
  { value: "12", label: "Seats at the chef's counter" },
  { value: "3 wks", label: "From green bean to your cup" },
];

export function OurStory() {
  return (
    <section
      id="story"
      aria-label="Our story"
      className="bg-espresso px-6 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
              <Image
                src={unsplash("1414235077428-338989a2e8c0", 900)}
                alt="A dish plated tableside in warm candlelight at Smaplee"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-4 hidden aspect-square w-40 overflow-hidden rounded-3xl border-4 border-espresso sm:block lg:w-48">
              <Image
                src={unsplash("1495474472287-4d71bcdd2085", 400)}
                alt="Friends sharing coffee at the café counter"
                fill
                sizes="192px"
                className="object-cover"
              />
            </div>
          </div>

          <div>
            <p className="font-body text-xs uppercase tracking-[0.35em] text-saffron">
              Our Story
            </p>
            <h2 className="mt-4 text-balance font-display text-4xl italic text-linen sm:text-5xl">
              It started with one table
            </h2>
            <div className="mt-6 space-y-4 text-linen/75">
              <p>
                Smaplee began in 2019 as eight seats, one oven, and a menu
                written each morning on the back of a flour bag. The
                neighborhood kept showing up, so we kept adding rooms — first
                the café, then the bar, then the bakery that now feeds them
                all.
              </p>
              <p>
                Nothing here moves fast on purpose. The levain is older than
                the business. The lamb takes eight hours. The coffee is roasted
                twenty steps from where it&apos;s poured. We think you can
                taste the difference — come decide for yourself.
              </p>
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-6">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-display text-3xl italic text-saffron">
                    {stat.value}
                  </dd>
                  <dd className="mt-1 text-sm text-linen/60">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
