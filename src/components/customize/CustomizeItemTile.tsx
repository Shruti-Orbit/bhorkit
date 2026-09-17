"use client";

import { Check, Plus } from "lucide-react";
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
 * One item the customer can put in their box. The whole card is the "add"
 * control until it is in the box; then it shows how many, with a stepper.
 * No price is shown — the box is priced as a whole.
 */
export function CustomizeItemTile({ item, quantity, maxQuantity, boxFull, onAdd, onQuantity }: CustomizeItemTileProps) {
  const selected = quantity > 0;
  const initial = item.name.trim().charAt(0).toUpperCase() || "•";

  const body = (
    <>
      <span
        aria-hidden
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bhor-display text-bhor-product font-bhor-semibold transition-colors ${
          selected ? "bg-bhor-primary text-white" : "bg-bhor-peach text-bhor-primary"
        }`}
      >
        {initial}
      </span>
      <span className="mt-3 line-clamp-2 min-h-[2.5em] text-bhor-small font-bhor-semibold leading-bhor-heading text-bhor-text">
        {item.name}
      </span>
      <span className="mt-1.5 inline-flex w-fit items-center rounded-full border border-bhor-border bg-bhor-cream px-2.5 py-0.5 text-bhor-caption font-bhor-medium text-bhor-text-muted">
        {item.pack}
      </span>
    </>
  );

  if (!item.inStock) {
    return (
      <div
        aria-disabled="true"
        className="flex h-full flex-col rounded-bhor-md border border-dashed border-bhor-border bg-bhor-cream p-3 opacity-70 sm:p-4"
      >
        {body}
        <span className="mt-auto pt-3">
          <span className="inline-flex min-h-9 w-full items-center justify-center rounded-bhor-sm bg-bhor-border/60 text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">
            Out of stock
          </span>
        </span>
      </div>
    );
  }

  if (selected) {
    return (
      <div className="relative flex h-full flex-col rounded-bhor-md border border-bhor-primary bg-bhor-primary-soft/35 p-3 shadow-bhor-soft ring-1 ring-bhor-primary sm:p-4">
        <span
          aria-hidden
          className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-bhor-primary text-white"
        >
          <Check className="h-3.5 w-3.5" />
        </span>
        {body}
        <div className="mt-auto pt-3">
          <QuantityStepper name={item.name} quantity={quantity} max={maxQuantity} onChange={onQuantity} />
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={boxFull}
      className="group flex h-full w-full flex-col rounded-bhor-md border border-bhor-border bg-bhor-surface p-3 text-left transition duration-200 hover:-translate-y-0.5 hover:border-bhor-primary/60 hover:shadow-bhor-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:p-4"
    >
      {body}
      <span className="mt-auto pt-3">
        <span className="inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-bhor-sm border border-bhor-primary text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-primary transition-colors group-hover:bg-bhor-primary group-hover:text-white group-disabled:group-hover:bg-transparent group-disabled:group-hover:text-bhor-primary">
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Add <span className="sr-only">{item.name} to your box</span>
        </span>
      </span>
    </button>
  );
}
