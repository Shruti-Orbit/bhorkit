"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { heroSlides } from "@/src/data/heroSlides";
import { HeroControls } from "./HeroControls";
import { HeroSlide } from "./HeroSlide";

const AUTOPLAY_DELAY = 5500;
const SWIPE_THRESHOLD = 48;

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const goToSlide = useCallback(
    (index: number) => {
      setCurrentSlide(index);
      setIsPaused(true);
    },
    [],
  );

  const goToNext = useCallback(() => {
    setCurrentSlide((slide) => (slide + 1) % heroSlides.length);
    setIsPaused(true);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentSlide((slide) => (slide - 1 + heroSlides.length) % heroSlides.length);
    setIsPaused(true);
  }, []);

  useEffect(() => {
    heroSlides.forEach((slide) => {
      const image = new window.Image();
      image.src = slide.image;
    });
  }, []);

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrentSlide((slide) => (slide + 1) % heroSlides.length);
    }, AUTOPLAY_DELAY);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  useEffect(() => {
    if (!isPaused) {
      return;
    }

    const timer = window.setTimeout(() => setIsPaused(false), AUTOPLAY_DELAY);
    return () => window.clearTimeout(timer);
  }, [isPaused]);

  return (
    <section
      aria-label="Featured BHORKIT festival collections"
      className="relative w-full overflow-hidden bg-bhor-cream"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          goToPrevious();
        }

        if (event.key === "ArrowRight") {
          goToNext();
        }
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null) {
          return;
        }

        const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX.current;
        const distance = touchEndX - touchStartX.current;

        if (Math.abs(distance) > SWIPE_THRESHOLD) {
          if (distance > 0) {
            goToPrevious();
          } else {
            goToNext();
          }
        }

        touchStartX.current = null;
      }}
    >
      <div className="relative grid w-full overflow-hidden bg-bhor-peach md:h-[calc(100svh-132px)] md:min-h-[560px]">
        <AnimatePresence initial={false} mode="sync">
          <HeroSlide
            key={heroSlides[currentSlide].id}
            slide={heroSlides[currentSlide]}
            priority={currentSlide === 0}
          />
        </AnimatePresence>

        <HeroControls
          currentSlide={currentSlide}
          slideCount={heroSlides.length}
          onPrevious={goToPrevious}
          onNext={goToNext}
          onSelect={goToSlide}
        />
      </div>
    </section>
  );
}
