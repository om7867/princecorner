"use client";

import Image from "next/image";
import { useLuxuryReveal } from "@/hooks/useLuxuryReveal";

type LayoutType = "text-left" | "text-right" | "centered" | "split";

interface PrinceCornerSectionProps {
  layout: LayoutType;
  tagline: string;
  heading: string;
  paragraph: string;
  imageSrc: string;
  imageAlt: string;
  buttonText?: string;
  bgColor?: string;
  headingColor?: string;
  textColor?: string;
  taglineColor?: string;
}

export function PrinceCornerSection({
  layout,
  tagline,
  heading,
  paragraph,
  imageSrc,
  imageAlt,
  buttonText,
  bgColor = "bg-[#fdfbf7]",
  headingColor = "text-[#8B0000]",
  textColor = "text-[#5c1f1f]/80",
  taglineColor = "text-[#b71c1c]",
}: PrinceCornerSectionProps) {
  const containerRef = useLuxuryReveal();

  const renderTextContent = () => (
    <div className={`flex flex-col justify-center ${layout === "centered" ? "items-center text-center mx-auto max-w-3xl" : "max-w-xl"}`}>
      <p className={`luxury-paragraph mb-4 font-body text-xs uppercase tracking-[0.3em] ${taglineColor}`}>
        {tagline}
      </p>
      <h2 className={`luxury-heading mb-8 font-display text-4xl leading-tight sm:text-5xl lg:text-6xl ${headingColor}`}>
        {heading}
      </h2>
      <p className={`luxury-paragraph font-body text-lg leading-relaxed ${textColor}`}>
        {paragraph}
      </p>
      {buttonText && (
        <button className="luxury-paragraph premium-hover group mt-12 w-fit overflow-hidden rounded-full border border-current opacity-70 bg-transparent px-8 py-4 transition-all duration-500 hover:opacity-100 hover:bg-black/5">
          <span className={`font-body text-sm font-medium tracking-widest transition-colors duration-500 ${headingColor}`}>
            {buttonText}
          </span>
        </button>
      )}
    </div>
  );

  const renderImageContent = () => (
    <div className={`w-full overflow-hidden ${layout === "centered" ? "mt-16 aspect-video" : "aspect-[4/5] lg:aspect-[3/4]"}`}>
      <div className="luxury-image-container relative h-full w-full" data-parallax="0.10">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover transition-transform duration-700 ease-[var(--ease-cubic)] hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
    </div>
  );

  if (layout === "centered") {
    return (
      <section ref={containerRef as any} className={`relative py-32 px-6 lg:px-12 ${bgColor}`}>
        <div className="mx-auto max-w-7xl">
          {renderTextContent()}
          {renderImageContent()}
        </div>
      </section>
    );
  }

  if (layout === "split") {
    return (
      <section ref={containerRef as any} className={`relative py-32 px-6 lg:px-12 ${bgColor}`}>
        <div className="mx-auto max-w-7xl flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          <div className="w-full lg:w-1/2">
            <h2 className={`luxury-heading mb-8 font-display text-4xl leading-tight sm:text-5xl lg:text-6xl ${headingColor}`}>
              {heading}
            </h2>
          </div>
          <div className="w-full lg:w-1/2 flex flex-col gap-8">
             <div className="luxury-image-container relative w-full aspect-video">
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  fill
                  className="object-cover"
                />
             </div>
             <p className={`luxury-paragraph font-body text-lg leading-relaxed ${textColor}`}>
                {paragraph}
             </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef as any} className={`relative py-32 px-6 lg:px-12 ${bgColor}`}>
      <div className={`mx-auto max-w-7xl flex flex-col gap-16 lg:gap-24 ${
        layout === "text-left" ? "lg:flex-row" : "lg:flex-row-reverse"
      }`}>
        <div className="w-full lg:w-1/2 flex items-center">
          {renderTextContent()}
        </div>
        <div className="w-full lg:w-1/2">
          {renderImageContent()}
        </div>
      </div>
    </section>
  );
}
