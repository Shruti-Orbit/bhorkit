"use client";

import { motion } from "framer-motion";
import type { HeroSlide as HeroSlideData } from "@/src/data/heroSlides";
import { HeroBanner } from "./HeroBanner";
import { HeroContent } from "./HeroContent";
import { HeroImage } from "./HeroImage";

type HeroSlideProps = {
  slide: HeroSlideData;
  priority?: boolean;
};

const slideVariants = {
  enter: {
    opacity: 0,
  },
  center: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

export function HeroSlide({ slide, priority = false }: HeroSlideProps) {
  return (
    <motion.div
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.72, ease: [0.4, 0, 0.2, 1] }}
      className="relative col-start-1 row-start-1 h-full overflow-hidden bg-bhor-peach"
    >
      {slide.kind === "banner" ? (
        <HeroBanner slide={slide} priority={priority} />
      ) : (
        <>
          <HeroImage slide={slide} priority={priority} />
          <HeroContent slide={slide} />
        </>
      )}
    </motion.div>
  );
}
