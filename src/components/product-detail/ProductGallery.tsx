"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { ProductImage } from "@/src/data/products";

type ProductGalleryProps = {
  images: ProductImage[];
  title: string;
};

// Native scroll-snap carries the swipe, so the index follows the scroll
// position instead of driving it: thumbnails and dots only scroll the track,
// and the scroll handler reports the landing slide back.
function scrollToIndex(
  track: HTMLDivElement | null,
  index: number,
  behavior: ScrollBehavior,
) {
  if (!track) {
    return;
  }

  track.scrollTo({ left: index * track.clientWidth, behavior });
}

function indexFromScroll(track: HTMLDivElement) {
  if (track.clientWidth === 0) {
    return 0;
  }

  return Math.round(track.scrollLeft / track.clientWidth);
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const lightboxTrackRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
    scrollToIndex(trackRef.current, index, "smooth");
  }, []);

  const step = useCallback((delta: number) => {
    setActiveIndex((index) => {
      const next = Math.min(Math.max(index + delta, 0), images.length - 1);
      scrollToIndex(lightboxTrackRef.current, next, "smooth");
      return next;
    });
  }, [images.length]);

  // The lightbox track mounts already scrolled to whatever slide was open
  // behind it, and the page track catches up on close.
  useEffect(() => {
    scrollToIndex(isOpen ? lightboxTrackRef.current : trackRef.current, activeIndex, "auto");
    // Open/close only: re-running on every swipe would fight the scroll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }

      if (event.key === "ArrowLeft") {
        step(-1);
      }

      if (event.key === "ArrowRight") {
        step(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, step]);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="md:grid md:grid-cols-[104px_1fr] md:gap-5">
      <div className="hidden md:flex md:flex-col md:gap-4">
        {images.map((image, index) => (
          <button
            key={`${image.src}-${index}`}
            type="button"
            aria-label={`View ${title} image ${index + 1}`}
            onClick={() => goToSlide(index)}
            className={`relative aspect-square overflow-hidden rounded-bhor-md border bg-bhor-surface transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary ${
              index === activeIndex ? "border-bhor-primary" : "border-bhor-border"
            }`}
          >
            <Image src={image.src} alt="" fill sizes="104px" className="object-cover" />
          </button>
        ))}
      </div>

      <div
        ref={trackRef}
        onScroll={(event) => setActiveIndex(indexFromScroll(event.currentTarget))}
        className="flex aspect-[4/3] w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-bhor-lg border border-bhor-border bg-bhor-peach [-ms-overflow-style:none] [scrollbar-width:none] md:aspect-[4/3] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((image, index) => (
          <button
            key={`${image.src}-slide-${index}`}
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label={`Expand ${title} image ${index + 1} of ${images.length}`}
            className="relative w-full shrink-0 basis-full snap-center overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bhor-primary"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority={index === 0}
              loading={index === 0 ? undefined : "eager"}
              sizes="(max-width: 767px) 100vw, 64vw"
              className="object-cover object-center transition-transform duration-500 hover:scale-[1.04]"
            />
          </button>
        ))}
      </div>

      <div className="mt-3 flex justify-center gap-2 md:hidden">
        {images.map((image, index) => (
          <button
            key={`${image.src}-dot-${index}`}
            type="button"
            aria-label={`View image ${index + 1}`}
            onClick={() => goToSlide(index)}
            className={`h-1.5 rounded-full transition-all ${
              index === activeIndex ? "w-6 bg-bhor-primary" : "w-2 bg-bhor-border"
            }`}
          />
        ))}
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-bhor-text/80 p-4">
          <button
            type="button"
            aria-label="Close gallery"
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-bhor-surface text-bhor-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
          <div
            ref={lightboxTrackRef}
            onScroll={(event) => setActiveIndex(indexFromScroll(event.currentTarget))}
            className="flex aspect-[4/3] w-full max-w-5xl snap-x snap-mandatory overflow-x-auto overscroll-contain rounded-bhor-lg bg-bhor-surface [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {images.map((image, index) => (
              <div
                key={`${image.src}-zoom-${index}`}
                className="relative w-full shrink-0 basis-full snap-center"
              >
                <Image src={image.src} alt={image.alt} fill sizes="90vw" className="object-contain" />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
