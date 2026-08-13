"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { ProductImage } from "@/src/data/products";

type ProductGalleryProps = {
  images: ProductImage[];
  title: string;
};

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="md:grid md:grid-cols-[104px_1fr] md:gap-5">
      <div className="hidden md:flex md:flex-col md:gap-4">
        {images.map((image, index) => (
          <button
            key={`${image.src}-${index}`}
            type="button"
            aria-label={`View ${title} image ${index + 1}`}
            onClick={() => setActiveIndex(index)}
            className={`relative aspect-square overflow-hidden rounded-bhor-md border bg-bhor-surface transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary ${
              index === activeIndex ? "border-bhor-primary" : "border-bhor-border"
            }`}
          >
            <Image src={image.src} alt="" fill sizes="104px" className="object-cover" />
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="relative aspect-[4/3] w-full overflow-hidden rounded-bhor-lg border border-bhor-border bg-bhor-peach focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary md:aspect-[4/3]"
      >
        <Image
          src={activeImage.src}
          alt={activeImage.alt}
          fill
          priority
          sizes="(max-width: 767px) 100vw, 64vw"
          className="object-cover object-center transition-transform duration-500 hover:scale-[1.04]"
        />
        <span className="absolute bottom-3 right-3 rounded-bhor-sm bg-bhor-surface px-3 py-1 text-bhor-caption font-bhor-semibold text-bhor-text">
          {activeIndex + 1} / {images.length}
        </span>
      </button>

      <div className="mt-3 flex justify-center gap-2 md:hidden">
        {images.map((image, index) => (
          <button
            key={`${image.src}-dot-${index}`}
            type="button"
            aria-label={`View image ${index + 1}`}
            onClick={() => setActiveIndex(index)}
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
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-bhor-surface text-bhor-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
          <div className="relative aspect-[4/3] w-full max-w-5xl overflow-hidden rounded-bhor-lg bg-bhor-surface">
            <Image src={activeImage.src} alt={activeImage.alt} fill sizes="90vw" className="object-contain" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
