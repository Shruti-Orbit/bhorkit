"use client";

import { Minus, Plus, Trash2 } from "lucide-react";

type QuantityStepperProps = {
  name: string;
  quantity: number;
  max: number;
  onChange: (quantity: number) => void;
  compact?: boolean;
};

/** − count + for one item in the box. Going below 1 removes it, so the minus becomes a bin. */
export function QuantityStepper({ name, quantity, max, onChange, compact = false }: QuantityStepperProps) {
  const size = compact ? "h-8 w-8" : "h-9 w-9";

  return (
    <div
      className={`inline-flex items-center justify-between rounded-lg bg-bhor-primary text-white shadow-sm ${
        compact ? "min-w-[88px]" : "w-full"
      }`}
    >
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        aria-label={quantity <= 1 ? `Remove ${name}` : `One less ${name}`}
        className={`flex ${size} items-center justify-center rounded-l-lg transition-colors hover:bg-bhor-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white`}
      >
        {quantity <= 1 ? <Trash2 className="h-3.5 w-3.5" aria-hidden /> : <Minus className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />}
      </button>
      <span
        className="min-w-6 text-center text-bhor-small font-bhor-bold tabular-nums"
        aria-live="polite"
        aria-label={`${quantity} of ${name} in your box`}
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        disabled={quantity >= max}
        aria-label={`One more ${name}`}
        className={`flex ${size} items-center justify-center rounded-r-lg transition-colors hover:bg-bhor-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent`}
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
      </button>
    </div>
  );
}
