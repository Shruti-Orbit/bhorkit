"use client";

import Image from "next/image";
import type { HeroSlide } from "@/src/data/heroSlides";

type HeroImageProps = {
  slide: HeroSlide;
  priority?: boolean;
};

export function HeroImage({ slide, priority = false }: HeroImageProps) {
  return (
    <div className="absolute inset-0 z-0 bg-bhor-peach">
      <Image
        src={slide.image}
        alt={slide.imageAlt}
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover object-[62%_bottom] md:object-center"
      />
    </div>
  );
}
