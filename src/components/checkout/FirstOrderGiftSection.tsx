"use client";

import { Check, Gift } from "lucide-react";
import type { CheckoutGiftState } from "@/src/lib/api/gift.api";

/**
 * The first-order gift card row, and the notice on later orders.
 *
 * Nothing here describes any gift, because nothing here has been told what any
 * gift is: the API serves a label per card and no other field exists on the
 * type. The mystery is the promotion, so the copy leans into it rather than
 * apologising for it.
 *
 * The selection is a courtesy — the server re-establishes eligibility and
 * re-reads the choice when the order is created, and ignores a selection from
 * anyone who is not on their first order.
 */
export function FirstOrderGiftSection({
  state,
  selectedGiftId,
  onSelect,
}: {
  state: CheckoutGiftState | null;
  selectedGiftId: string;
  onSelect: (giftId: string) => void;
}) {
  if (!state) return null;

  // A gift earned on an earlier order is travelling with this one.
  if (state.includedGiftLabel) {
    return (
      <section className="rounded-bhor-lg border border-bhor-border bg-bhor-surface p-5 shadow-bhor-soft">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bhor-primary-soft">
            <Gift className="h-5 w-5 text-bhor-primary" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-bhor-product font-bhor-bold text-bhor-text">
              Your selected gift has been added to this order.
            </h2>
            <p className="mt-1 text-bhor-small leading-bhor-body text-bhor-text-muted">
              {state.includedGiftLabel} is on its way — it will arrive with this delivery.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!state.eligible || state.options.length === 0) return null;

  return (
    <section className="rounded-bhor-lg border border-bhor-border bg-bhor-surface p-5 shadow-bhor-soft">
      <h2 className="flex items-center gap-2 text-bhor-product font-bhor-bold text-bhor-text">
        <Gift className="h-5 w-5 text-bhor-primary" aria-hidden />
        Pick your first-order gift
      </h2>
      <p className="mt-2 text-bhor-small leading-bhor-body text-bhor-text-muted">
        A little thank you for your first order. Choose one — it stays a surprise until it arrives,
        and it will be sent free with your next order.
      </p>

      <div
        role="radiogroup"
        aria-label="Choose your first-order gift"
        className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {state.options.map((option) => {
          const isSelected = option.id === selectedGiftId;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(isSelected ? "" : option.id)}
              className={`relative flex min-h-[104px] flex-col items-center justify-center gap-2 rounded-bhor-md border p-3 text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary ${
                isSelected
                  ? "border-bhor-primary bg-bhor-primary-soft"
                  : "border-bhor-border bg-bhor-cream hover:border-bhor-primary"
              }`}
            >
              {isSelected ? (
                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-bhor-primary">
                  <Check className="h-3 w-3 text-white" aria-hidden />
                </span>
              ) : null}
              <Gift
                className={`h-7 w-7 ${isSelected ? "text-bhor-primary" : "text-bhor-gold"}`}
                aria-hidden
              />
              <span
                className={`text-bhor-caption font-bhor-bold uppercase tracking-wide ${
                  isSelected ? "text-bhor-primary-dark" : "text-bhor-text"
                }`}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-bhor-caption text-bhor-text-muted">
        Optional — you can place your order without choosing one.
      </p>
    </section>
  );
}
