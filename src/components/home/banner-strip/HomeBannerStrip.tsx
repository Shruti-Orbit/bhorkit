"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { homeBanners } from "@/src/data/homeBanners";

const loopOffset = homeBanners.length;
const carouselBanners = [...homeBanners, ...homeBanners, ...homeBanners];

export function HomeBannerStrip() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    const carousel = carouselRef.current;
    const safeIndex = (index + homeBanners.length) % homeBanners.length;
    const target = carousel?.children[loopOffset + safeIndex] as HTMLElement | undefined;

    if (!carousel || !target) {
      return;
    }

    const targetLeft =
      target.offsetLeft - carousel.offsetLeft - (carousel.clientWidth - target.clientWidth) / 2;

    carousel.scrollTo({
      left: Math.max(0, targetLeft),
      behavior,
    });

    setActiveIndex(safeIndex);
  }, []);

  const goToNext = () => {
    scrollToIndex(activeIndex + 1);
  };

  const goToPrevious = () => {
    scrollToIndex(activeIndex - 1);
  };

  useEffect(() => {
    scrollToIndex(0, "auto");

    const interval = window.setInterval(() => {
      setActiveIndex((currentIndex) => {
        const nextIndex = (currentIndex + 1) % homeBanners.length;
        const carousel = carouselRef.current;
        const target = carousel?.children[loopOffset + nextIndex] as HTMLElement | undefined;

        if (carousel && target) {
          const targetLeft =
            target.offsetLeft -
            carousel.offsetLeft -
            (carousel.clientWidth - target.clientWidth) / 2;

          carousel.scrollTo({
            left: Math.max(0, targetLeft),
            behavior: "smooth",
          });
        }

        return nextIndex;
      });
    }, 3600);

    return () => window.clearInterval(interval);
  }, [scrollToIndex]);

  return (
    <section className="bg-bhor-cream pb-2 pt-4">
      <div className="relative">
        <div
          ref={carouselRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-[6vw] pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-6 md:px-[10vw]"
        >
          {carouselBanners.map((banner, index) => (
            <Link
              key={`${banner.id}-${index}`}
              href={banner.href}
              onFocus={() => scrollToIndex(index % homeBanners.length)}
              className={`relative block ${banner.aspectClass} max-h-[220px] w-[82vw] shrink-0 snap-center overflow-hidden rounded-[28px] bg-bhor-surface shadow-bhor-soft ring-1 ring-bhor-border/60 transition-opacity duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary sm:w-[76vw] md:max-h-[260px] md:w-[68vw] lg:max-h-[300px] lg:w-[60vw] xl:max-h-[320px] xl:w-[56vw]`}
            >
              <Image
                src={banner.image}
                alt={banner.alt}
                fill
                sizes="(max-width: 640px) 88vw, (max-width: 1024px) 76vw, 68vw"
                priority={index === loopOffset}
                className="object-cover object-center"
              />
            </Link>
          ))}
        </div>

        <button
          type="button"
          aria-label="Previous banner"
          onClick={goToPrevious}
          className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-bhor-surface text-bhor-text shadow-bhor-soft transition hover:text-bhor-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary md:flex lg:left-8"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Next banner"
          onClick={goToNext}
          className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-bhor-primary text-white shadow-bhor-soft transition hover:bg-bhor-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary md:flex lg:right-8"
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </section>
  );
}
