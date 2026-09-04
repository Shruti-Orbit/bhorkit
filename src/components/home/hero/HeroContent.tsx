"use client";

import Link from "next/link";
import { Box, HandHeart, Truck } from "lucide-react";
import type { HeroSlide } from "@/src/data/heroSlides";

type HeroContentProps = {
  slide: HeroSlide;
};

const trustItems = [
  {
    icon: Box,
    title: "Premium Quality",
    subtitle: "Items",
  },
  {
    icon: HandHeart,
    title: "Curated with",
    subtitle: "Devotion",
  },
  {
    icon: Truck,
    title: "Delivery in",
    subtitle: "Patna",
  },
];

export function HeroContent({ slide }: HeroContentProps) {
  return (
    <div className="relative z-10 flex h-full max-w-[520px] flex-col justify-start px-5 pb-10 pt-6 sm:px-8 sm:pt-8 md:w-[42%] md:justify-center md:px-10 md:py-14 lg:px-14 xl:px-20">
      <p
        className="mb-3 text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-primary md:mb-4 md:text-bhor-small"
      >
        {slide.eyebrow}
      </p>

      <h1 className="font-bhor-display text-bhor-h2-mobile font-bhor-bold leading-bhor-tight text-bhor-text min-[390px]:text-bhor-h1-mobile sm:text-bhor-hero-mobile md:text-bhor-h1 lg:text-bhor-hero">
        <span className="block whitespace-nowrap">{slide.title}</span>
        <span className="block whitespace-nowrap text-bhor-primary">
          {slide.highlightedTitle}
        </span>
      </h1>

      <p
        className="mt-3 max-w-[27ch] text-bhor-body-mobile leading-bhor-body text-bhor-text-muted md:mt-5 md:max-w-md md:text-bhor-body"
      >
        {slide.description}
      </p>

      <div
        className="mt-5 flex flex-wrap gap-2.5 md:mt-7 md:flex-nowrap md:gap-3"
      >
        <Link
          href={slide.primaryHref}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-bhor-sm bg-bhor-primary px-3 text-bhor-badge font-bhor-semibold uppercase text-white transition-colors hover:bg-bhor-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary min-[390px]:min-h-11 min-[390px]:px-4 min-[390px]:text-bhor-button-mobile md:gap-2 md:px-6 md:text-bhor-button"
        >
          {slide.primaryCta}
        </Link>
        <Link
          href={slide.secondaryHref}
          className="inline-flex min-h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-bhor-sm border border-bhor-border bg-bhor-surface px-3 text-bhor-badge font-bhor-semibold uppercase text-bhor-text transition-colors hover:border-bhor-primary hover:text-bhor-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary min-[390px]:min-h-11 min-[390px]:px-4 min-[390px]:text-bhor-button-mobile md:px-6 md:text-bhor-button"
        >
          {slide.secondaryCta}
        </Link>
      </div>

      <div
        className="mt-7 hidden max-w-lg grid-cols-3 gap-3 md:grid md:mt-8 md:gap-4"
      >
        {trustItems.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.title} className="flex items-center gap-2 md:gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-bhor-border bg-bhor-surface text-bhor-gold md:h-9 md:w-9">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <p className="text-bhor-caption font-bhor-semibold leading-bhor-heading text-bhor-text">
                <span className="block">{item.title}</span>
                <span className="block text-bhor-text-muted">{item.subtitle}</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
