"use client";

import Image from "next/image";
import { Check, PackageOpen } from "lucide-react";
import type { CustomizationItem } from "@/src/lib/api/customization.api";
import { QuantityStepper } from "./QuantityStepper";

type CustomizeItemTileProps = {
  item: CustomizationItem;
  /** How many are in the box; 0 when it isn't. */
  quantity: number;
  maxQuantity: number;
  /** The box already holds the most different items allowed. */
  boxFull: boolean;
  onAdd: () => void;
  onQuantity: (quantity: number) => void;
};

/**
 * The item's photo on a paper-cream plate, or a plain placeholder when there is
 * none.
 *
 * Takes the URL the API supplied rather than deriving one from the item's name.
 * The old version matched the name against a hardcoded word list to pick a file
 * out of public/images/customize, which meant a rename silently swapped an
 * item's photo and a new item had none until someone shipped a frontend change.
 */
export function ItemPhoto({ src, className = "", sizes }: { src: string | null; className?: string; sizes: string }) {
  return (
    <span className={`relative block overflow-hidden bg-[#F6EEE3] ${className}`}>
      {src ? (
        <Image src={src} alt="" fill sizes={sizes} className="object-cover" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-bhor-gold/70">
          <PackageOpen className="h-1/3 w-1/3" strokeWidth={1.4} aria-hidden />
        </span>
      )}
    </span>
  );
}

/**
 * One item the customer can put in their box, laid out like a store shelf
 * card: photo, name, pack, and an Add button that becomes a stepper.
 * No price is shown — the box is priced as a whole.
 */
export function CustomizeItemTile({ item, quantity, maxQuantity, boxFull, onAdd, onQuantity }: CustomizeItemTileProps) {
  const selected = quantity > 0;
  const soldOut = !item.inStock;

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-xl border bg-white transition-shadow duration-200 ${
        selected
          ? "border-bhor-primary/60 shadow-[0_0_0_1px_rgb(169_22_74/0.35)]"
          : "border-[#ECE3D8] hover:shadow-[0_8px_24px_-12px_rgb(36_26_28/0.25)]"
      }`}
    >
      <div className="relative">
        <ItemPhoto
          src={item.image}
          sizes="(min-width: 1280px) 240px, (min-width: 640px) 30vw, 45vw"
          className={`aspect-square w-full [&_img]:transition-transform [&_img]:duration-500 ${
            soldOut ? "grayscale" : "group-hover:[&_img]:scale-105"
          }`}
        />
        {soldOut ? (
          <span className="absolute inset-0 flex items-center justify-center bg-white/45">
            <span className="rounded-md bg-bhor-text/85 px-2.5 py-1 text-bhor-badge font-bhor-bold uppercase tracking-wide text-white">
              Out of stock
            </span>
          </span>
        ) : null}
        {selected ? (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-bhor-primary px-1.5 py-0.5 text-bhor-badge font-bhor-bold text-white shadow-sm">
            <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
            In box
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5">
        <h3 className={`line-clamp-2 text-bhor-small font-bhor-semibold capitalize leading-snug ${soldOut ? "text-bhor-text-muted" : "text-bhor-text"}`}>
          {item.name}
        </h3>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="text-bhor-caption text-bhor-text-muted">{item.pack}</span>
          {soldOut ? (
            <span
              aria-disabled="true"
              className="inline-flex h-8 min-w-[72px] items-center justify-center rounded-lg border border-[#E3D9CD] text-bhor-caption font-bhor-bold uppercase text-bhor-text-muted/70"
            >
              Add
            </span>
          ) : selected ? (
            <QuantityStepper compact name={item.name} quantity={quantity} max={maxQuantity} onChange={onQuantity} />
          ) : (
            <button
              type="button"
              onClick={onAdd}
              disabled={boxFull}
              className="inline-flex h-8 min-w-[72px] items-center justify-center rounded-lg border border-bhor-primary bg-bhor-primary-soft/40 px-4 text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-primary transition-colors hover:bg-bhor-primary hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-bhor-primary-soft/40 disabled:hover:text-bhor-primary"
            >
              Add <span className="sr-only">{item.name} to your box</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
