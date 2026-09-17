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
      className={`inline-flex items-center justify-between rounded-bhor-sm border border-bhor-primary bg-bhor-surface ${
        compact ? "" : "w-full"
      }`}
    >
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        aria-label={quantity <= 1 ? `Remove ${name}` : `One less ${name}`}
        className={`flex ${size} items-center justify-center rounded-l-bhor-sm text-bhor-primary transition-colors hover:bg-bhor-primary-soft`}
      >
        {quantity <= 1 ? <Trash2 className="h-3.5 w-3.5" aria-hidden /> : <Minus className="h-3.5 w-3.5" aria-hidden />}
      </button>
      <span
        className="min-w-8 px-1 text-center text-bhor-small font-bhor-bold text-bhor-text"
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
        className={`flex ${size} items-center justify-center rounded-r-bhor-sm text-bhor-primary transition-colors hover:bg-bhor-primary-soft disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent`}
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}
