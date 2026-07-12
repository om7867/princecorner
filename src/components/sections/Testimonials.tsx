const REVIEWS = [
  {
    quote:
      "The lamb shoulder is the reason we moved our anniversary dinner here — three years running now.",
    name: "Priya & Daniel",
    source: "Google Reviews",
    stars: 5,
  },
  {
    quote:
      "I came for a coffee, stayed for four hours, and left with a loaf of bread and a dinner reservation.",
    name: "Marcus T.",
    source: "Yelp",
    stars: 5,
  },
  {
    quote:
      "The chef's counter is the best seat in the city. Watching the fire while they narrate each course — unforgettable.",
    name: "Aiko S.",
    source: "TripAdvisor",
    stars: 5,
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div
      aria-label={`${count} out of 5 stars`}
      className="flex gap-0.5 text-saffron"
    >
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 14 14" aria-hidden>
          <path
            d="M7 1l1.8 3.9 4.2.5-3.1 2.9.8 4.2L7 10.4 3.3 12.5l.8-4.2L1 5.4l4.2-.5L7 1z"
            fill="currentColor"
          />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section
      id="reviews"
      aria-label="What guests say"
      className="bg-linen-soft px-6 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="font-body text-xs uppercase tracking-[0.35em] text-terracotta">
            Word of Mouth
          </p>
          <h2 className="mt-4 text-balance font-display text-4xl italic text-espresso sm:text-5xl">
            What our guests keep saying
          </h2>
        </div>

        <ul className="mt-14 grid gap-6 md:grid-cols-3" role="list">
          {REVIEWS.map((review) => (
            <li
              key={review.name}
              className="flex flex-col rounded-3xl border border-espresso/10 bg-linen p-7 transition-shadow duration-500 hover:shadow-lg hover:shadow-espresso/5"
            >
              <Stars count={review.stars} />
              <blockquote className="mt-4 flex-1">
                <p className="font-display text-lg italic leading-relaxed text-espresso">
                  “{review.quote}”
                </p>
              </blockquote>
              <footer className="mt-6 flex items-baseline justify-between gap-3">
                <span className="font-body text-sm font-semibold text-espresso">
                  {review.name}
                </span>
                <span className="font-body text-xs text-espresso/50">
                  {review.source}
                </span>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
