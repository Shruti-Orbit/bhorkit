"use client";

import Link from "next/link";
import { getImageProps } from "next/image";
import type { HeroBannerSlide } from "@/src/data/heroSlides";
import { HERO_MOBILE_MEDIA } from "./HeroImage";

const HERO_DESKTOP_MEDIA = "(min-width: 768px)";

type HeroBannerProps = {
  slide: HeroBannerSlide;
  priority?: boolean;
};

/**
 * A finished banner: the artwork already carries its copy and button, so it is
 * shown edge to edge — the hero takes the artwork's own shape on wide screens,
 * and phones get its portrait version — and the whole banner is the link.
 */
export function HeroBanner({ slide, priority = false }: HeroBannerProps) {
  const shared = { alt: slide.imageAlt, fill: true, priority, sizes: "100vw" } as const;

  const {
    props: { srcSet: mobileSrcSet },
  } = getImageProps({ ...shared, src: slide.imageMobile ?? slide.image });

  const {
    props: { srcSet: desktopSrcSet, ...imgProps },
  } = getImageProps({ ...shared, src: slide.image });

  return (
    <Link
      href={slide.href}
      aria-label={slide.title}
      className="group absolute inset-0 z-0 block overflow-hidden bg-bhor-peach focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-bhor-primary"
    >
      {/* The page keeps one headline per slide, as the text slides do. */}
      <h1 className="sr-only">{slide.title}</h1>

      {priority ? (
        <>
          <link rel="preload" as="image" media={HERO_MOBILE_MEDIA} imageSrcSet={mobileSrcSet} imageSizes="100vw" />
          <link rel="preload" as="image" media={HERO_DESKTOP_MEDIA} imageSrcSet={desktopSrcSet} imageSizes="100vw" />
        </>
      ) : null}

      <picture>
        <source media={HERO_MOBILE_MEDIA} srcSet={mobileSrcSet} sizes="100vw" />
        <source srcSet={desktopSrcSet} sizes="100vw" />
        {/* eslint-disable-next-line jsx-a11y/alt-text -- alt comes from imgProps */}
        <img
          {...imgProps}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.015]"
        />
      </picture>
    </Link>
  );
}
