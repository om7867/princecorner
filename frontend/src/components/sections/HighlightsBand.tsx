import { Reveal } from "@/components/ui/Reveal";

const MARQUEE_WORDS = [
  "Farm to Table",
  "Wood-Fired",
  "Fresh Baked Daily",
  "Award-Winning Wine List",
  "Locally Sourced",
  "Open Late",
];

const HIGHLIGHTS = [
  {
    title: "Farm to table",
    body: "Produce and meat sourced from growers within a day's drive, not a warehouse.",
    icon: (
      <path
        d="M8 15c-3.5 0-6-2.5-6-6 3.5 0 6 2.5 6 6zm0 0c0-5 2-8 6-9-1 5-2 8-6 9zm0 0v3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Cooked over fire",
    body: "Every hearth dish finishes on live coals — the same way it did on day one.",
    icon: (
      <path
        d="M8 15.5c3 0 5-2 5-4.6 0-2-1.3-3-1.9-4.4-.4 1-1 1.4-1.6 1-.6-2-1-3.7-2.5-5.5-.3 2.2-1 3.3-2.3 4.7C3.4 8.3 3 9.6 3 10.9c0 2.6 2 4.6 5 4.6z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Fresh baked daily",
    body: "The bakery starts before sunrise so the bread on your table is always same-day.",
    icon: (
      <path
        d="M2.5 9.5h11l-1 5.5h-9l-1-5.5zM4 9.5a4 4 0 018 0"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Award-winning",
    body: "Recognized three years running for our wine list and chef's tasting menu.",
    icon: (
      <path
        d="M8 1.5l1.8 3.9 4.2.5-3.1 2.9.8 4.2L8 10.9l-3.7 2.1.8-4.2-3.1-2.9 4.2-.5L8 1.5z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    ),
  },
];

export function HighlightsBand() {
  const words = [...MARQUEE_WORDS, ...MARQUEE_WORDS];

  return (
    <section aria-label="Why guests love us">
      <div className="marquee bg-espresso py-4">
        <div>
          {[...words, ...words].map((word, i) => (
            <span
              key={i}
              className="flex items-center px-6 font-display text-lg italic text-linen/90 sm:text-xl"
            >
              {word}
              <span aria-hidden className="ml-6 h-1.5 w-1.5 rounded-full bg-saffron" />
            </span>
          ))}
        </div>
      </div>

      <div className="bg-linen-soft px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal stagger>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" role="list">
              {HIGHLIGHTS.map((item) => (
                <li
                  key={item.title}
                  className="rounded-3xl border border-espresso/10 bg-linen p-6 transition-shadow duration-500 hover:shadow-lg hover:shadow-espresso/5"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-saffron/15 text-terracotta">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                      {item.icon}
                    </svg>
                  </span>
                  <h3 className="mt-4 font-display text-lg italic text-espresso">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-espresso/70">{item.body}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
