"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Gift, Percent } from "lucide-react";
import { shoppingCategories } from "@/src/data/categories";

const fallbackIcons = {
  "return-gifts": Gift,
  "festive-offers": Percent,
  "pre-order": CalendarDays,
};

export function CategoryStrip() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller || !window.matchMedia("(min-width: 768px)").matches) {
      return;
    }

    const activeScroller = scroller;
    let frameId = 0;
    let lastTimestamp = 0;
    const speed = 26;

    function animate(timestamp: number) {
      if (!window.matchMedia("(min-width: 768px)").matches) {
        frameId = window.requestAnimationFrame(animate);
        return;
      }

      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }

      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      if (!isPausedRef.current) {
        const maxScroll = activeScroller.scrollWidth - activeScroller.clientWidth;

        if (maxScroll > 0) {
          activeScroller.scrollLeft =
            activeScroller.scrollLeft >= maxScroll - 1
              ? 0
              : activeScroller.scrollLeft + (speed * delta) / 1000;
        }
      }

      frameId = window.requestAnimationFrame(animate);
    }

    frameId = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  function scroll(direction: "left" | "right") {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    scroller.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth",
    });
  }

  return (
    <section className="w-full bg-bhor-cream pb-4 pt-1">
      <div className="w-full">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="px-4 text-bhor-product font-bhor-bold text-bhor-text sm:px-6 lg:px-8">
            Shop by Category
          </h2>
          <div className="hidden items-center gap-2 px-4 sm:px-6 md:flex lg:px-8">
            <button
              type="button"
              aria-label="Previous categories"
              onClick={() => scroll("left")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-bhor-surface text-bhor-text shadow-bhor-soft hover:text-bhor-primary"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Next categories"
              onClick={() => scroll("right")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-bhor-primary text-white shadow-bhor-soft hover:bg-bhor-primary-dark"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          onMouseEnter={() => {
            isPausedRef.current = true;
          }}
          onMouseLeave={() => {
            isPausedRef.current = false;
          }}
          onTouchStart={() => {
            isPausedRef.current = true;
          }}
          onTouchEnd={() => {
            isPausedRef.current = false;
          }}
          className="flex w-full snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-6 lg:px-8"
        >
          {shoppingCategories.map((category) => {
            const Icon = fallbackIcons[category.id as keyof typeof fallbackIcons];

            return (
              <Link
                key={category.id}
                href={category.href}
                className="flex w-[112px] shrink-0 snap-start flex-col items-center text-center transition hover:-translate-y-0.5 md:w-[156px] xl:w-[178px]"
              >
                <span className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-bhor-border bg-bhor-surface shadow-bhor-soft md:h-24 md:w-24">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.label}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : Icon ? (
                    <Icon className="h-8 w-8 text-bhor-primary" aria-hidden />
                  ) : null}
                </span>
                <span className="mt-2 line-clamp-2 min-h-[28px] text-bhor-caption font-bhor-semibold leading-bhor-heading text-bhor-text">
                  {category.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
