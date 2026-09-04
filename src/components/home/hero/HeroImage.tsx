"use client";

import type { CSSProperties } from "react";
import { getImageProps } from "next/image";
import type { HeroSlide } from "@/src/data/heroSlides";

type HeroImageProps = {
  slide: HeroSlide;
  priority?: boolean;
};

/** Matches the `md` breakpoint Tailwind uses for the desktop hero layout. */
export const HERO_MOBILE_MEDIA = "(max-width: 767px)";
const HERO_DESKTOP_MEDIA = "(min-width: 768px)";

const DEFAULT_TINT = "var(--bhor-cream)";

export function HeroImage({ slide, priority = false }: HeroImageProps) {
  const shared = {
    alt: slide.imageAlt,
    fill: true,
    priority,
    sizes: "100vw",
  } as const;

  const {
    props: { srcSet: mobileSrcSet },
  } = getImageProps({ ...shared, src: slide.imageMobile ?? slide.image });

  const {
    props: { srcSet: desktopSrcSet, ...imgProps },
  } = getImageProps({ ...shared, src: slide.image });

  return (
    <div
      className="absolute inset-0 z-0 bg-[var(--hero-tint)]"
      style={{ "--hero-tint": slide.tint ?? DEFAULT_TINT } as CSSProperties}
    >
      {/*
        `getImageProps` drops the preload `<Image priority>` would emit, and `<Image>`
        cannot preload per-breakpoint anyway. React hoists these into <head>.
      */}
      {priority ? (
        <>
          <link
            rel="preload"
            as="image"
            media={HERO_MOBILE_MEDIA}
            imageSrcSet={mobileSrcSet}
            imageSizes="100vw"
          />
          <link
            rel="preload"
            as="image"
            media={HERO_DESKTOP_MEDIA}
            imageSrcSet={desktopSrcSet}
            imageSizes="100vw"
          />
        </>
      ) : null}
      <picture>
        <source media={HERO_MOBILE_MEDIA} srcSet={mobileSrcSet} sizes="100vw" />
        <source srcSet={desktopSrcSet} sizes="100vw" />
        {/* eslint-disable-next-line jsx-a11y/alt-text -- alt comes from imgProps */}
        <img
          {...imgProps}
          className="absolute inset-0 h-full w-full object-cover object-[62%_bottom] md:object-center"
        />
      </picture>
      {/* Mobile: the copy sits across the top of a portrait frame, so the scrim falls downwards. */}
      <div
        className="absolute inset-x-0 top-0 h-[62%] md:hidden"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, color-mix(in srgb, var(--hero-tint) 95%, transparent), color-mix(in srgb, var(--hero-tint) 82%, transparent) 42%, color-mix(in srgb, var(--hero-tint) 34%, transparent) 72%, transparent)",
        }}
        aria-hidden
      />
      {/* Desktop: the copy sits in the artwork's left-hand copy space. */}
      <div
        className="absolute inset-y-0 left-0 hidden w-[46%] md:block"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in srgb, var(--hero-tint) 92%, transparent), color-mix(in srgb, var(--hero-tint) 42%, transparent) 50%, transparent)",
        }}
        aria-hidden
      />
    </div>
  );
}
