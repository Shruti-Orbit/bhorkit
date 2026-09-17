"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRight, Info, Loader2, PackageOpen, X } from "lucide-react";
import { MAX_OCCASION_LENGTH } from "@/src/lib/customization/customBoxStore";
import { formatPaise } from "@/src/utils/money";
import { QuantityStepper } from "./QuantityStepper";

export type BoxPanelLine = {
  id: string;
  /** Null while the item list is still loading. */
  name: string | null;
  pack: string;
  quantity: number;
};

type CustomBoxPanelProps = {
  headingId: string;
  lines: BoxPanelLine[];
  occasion: string;
  minItems: number;
  maxQuantity: number;
  /** Paise; null until the first total arrives. */
  totalPaise: number | null;
  quoting: boolean;
  quoteError: string;
  notice: string;
  onDismissNotice: () => void;
  canCheckout: boolean;
  onProceed: () => void;
  onQuantity: (id: string, quantity: number) => void;
  onOccasion: (occasion: string) => void;
  onClear: () => void;
  /** Rendered inside the mobile sheet: no card chrome, and a close button. */
  onClose?: () => void;
};

/**
 * The customer's box: what is in it, how far it is from the minimum, and its
 * total. Shared by the desktop sidebar and the mobile bottom sheet.
 */
export function CustomBoxPanel({
  headingId,
  lines,
  occasion,
  minItems,
  maxQuantity,
  totalPaise,
  quoting,
  quoteError,
  notice,
  onDismissNotice,
  canCheckout,
  onProceed,
  onQuantity,
  onOccasion,
  onClear,
  onClose,
}: CustomBoxPanelProps) {
  const [confirmingClear, setConfirmingClear] = useState(false);
  const count = lines.length;
  const remaining = Math.max(0, minItems - count);
  const progress = minItems > 0 ? Math.min(100, Math.round((count / minItems) * 100)) : 0;
  const packs = lines.reduce((sum, line) => sum + line.quantity, 0);
  const inSheet = Boolean(onClose);

  const proceedLabel =
    remaining > 0
      ? `Add ${remaining} more item${remaining === 1 ? "" : "s"}`
      : quoting
        ? "Updating total…"
        : "Proceed to checkout";

  return (
    <section
      aria-labelledby={headingId}
      className={inSheet ? "" : "rounded-bhor-lg border border-bhor-border bg-bhor-surface shadow-bhor-soft"}
    >
      <div className="flex items-center justify-between gap-3 border-b border-bhor-border px-5 py-4">
        <h2 id={headingId} className="flex items-center gap-2 text-bhor-product font-bhor-bold text-bhor-text">
          <PackageOpen className="h-5 w-5 text-bhor-gold" aria-hidden />
          Your puja box
          {count > 0 ? (
            <span className="rounded-full bg-bhor-primary-soft px-2 py-0.5 text-bhor-caption font-bhor-bold text-bhor-primary">
              {count}
            </span>
          ) : null}
        </h2>
        <div className="flex items-center gap-1">
          {count > 0 && !confirmingClear ? (
            <button
              type="button"
              onClick={() => setConfirmingClear(true)}
              className="rounded-bhor-sm px-2 py-1 text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted transition-colors hover:text-bhor-error"
            >
              Clear
            </button>
          ) : null}
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close your box"
              className="flex h-9 w-9 items-center justify-center rounded-full text-bhor-text-muted transition-colors hover:bg-bhor-cream"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>

      {confirmingClear ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-bhor-border bg-bhor-peach px-5 py-3">
          <p className="text-bhor-small font-bhor-semibold text-bhor-text">Remove all {count} items?</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmingClear(false)}
              className="min-h-9 rounded-bhor-sm border border-bhor-border bg-bhor-surface px-3 text-bhor-caption font-bhor-bold uppercase text-bhor-text"
            >
              Keep
            </button>
            <button
              type="button"
              onClick={() => {
                onClear();
                setConfirmingClear(false);
              }}
              className="min-h-9 rounded-bhor-sm bg-bhor-error px-3 text-bhor-caption font-bhor-bold uppercase text-white"
            >
              Clear box
            </button>
          </div>
        </div>
      ) : null}

      <div className="space-y-4 px-5 py-4">
        <label className="block">
          <span className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">
            Which puja is this for? <span className="font-bhor-medium normal-case tracking-normal">(optional)</span>
          </span>
          <input
            value={occasion}
            onChange={(event) => onOccasion(event.target.value)}
            maxLength={MAX_OCCASION_LENGTH}
            placeholder="e.g. Satyanarayan Puja, Griha Pravesh"
            className="mt-1.5 min-h-11 w-full rounded-bhor-sm border border-bhor-border bg-bhor-cream px-3 text-bhor-small text-bhor-text outline-none transition-colors placeholder:text-bhor-text-muted/70 focus:border-bhor-primary"
          />
        </label>

        <div>
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-bhor-small font-bhor-semibold text-bhor-text">
              {count} of {minItems} items
            </p>
            <p className={`text-bhor-caption font-bhor-semibold ${remaining === 0 && count > 0 ? "text-bhor-success" : "text-bhor-text-muted"}`}>
              {count === 0 ? `Pick at least ${minItems}` : remaining > 0 ? `${remaining} more to go` : "Minimum reached"}
            </p>
          </div>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-bhor-cream ring-1 ring-inset ring-bhor-border"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={minItems}
            aria-valuenow={Math.min(count, minItems)}
            aria-label="Items in your box"
          >
            <div
              className={`h-full rounded-full transition-[width] duration-300 ${remaining === 0 && count > 0 ? "bg-bhor-success" : "bg-bhor-primary"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {count === 0 ? (
          <div className="flex flex-col items-center rounded-bhor-md border-2 border-dashed border-bhor-border bg-bhor-cream px-4 py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-bhor-surface shadow-bhor-soft">
              <PackageOpen className="h-7 w-7 text-bhor-gold" aria-hidden />
            </span>
            <p className="mt-4 text-bhor-small font-bhor-bold text-bhor-text">Your box is empty</p>
            <p className="mt-1 max-w-[16rem] text-bhor-caption leading-bhor-body text-bhor-text-muted">
              Tap the items you need to add them. Pick at least {minItems} different items for your puja.
            </p>
          </div>
        ) : (
          <ul className={`divide-y divide-bhor-border overflow-y-auto pr-1 ${inSheet ? "" : "max-h-[40vh]"}`}>
            {lines.map((line) => (
              <li key={line.id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-bhor-small font-bhor-semibold text-bhor-text">
                    {line.name ?? "Loading…"}
                  </p>
                  {line.pack ? (
                    <p className="text-bhor-caption text-bhor-text-muted">
                      {line.pack} × {line.quantity}
                    </p>
                  ) : null}
                </div>
                <QuantityStepper
                  compact
                  name={line.name ?? "this item"}
                  quantity={line.quantity}
                  max={maxQuantity}
                  onChange={(quantity) => onQuantity(line.id, quantity)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-3 border-t border-bhor-border px-5 py-4">
        {notice ? (
          <div role="status" className="flex items-start gap-2 rounded-bhor-sm bg-bhor-peach px-3 py-2 text-bhor-caption font-bhor-semibold text-bhor-primary-dark">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p className="flex-1">{notice}</p>
            <button type="button" onClick={onDismissNotice} aria-label="Dismiss" className="shrink-0">
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ) : null}

        {quoteError ? (
          <p role="alert" className="flex items-start gap-2 rounded-bhor-sm bg-bhor-peach px-3 py-2 text-bhor-caption font-bhor-semibold text-bhor-error">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {quoteError}
          </p>
        ) : null}

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">Box total</p>
            {count > 0 ? (
              <p className="text-bhor-caption text-bhor-text-muted">
                {count} item{count === 1 ? "" : "s"} · {packs} pack{packs === 1 ? "" : "s"}
              </p>
            ) : null}
          </div>
          <p className="flex items-center gap-2 font-bhor-display text-bhor-h4 font-bhor-bold text-bhor-text" aria-live="polite">
            {quoting && count > 0 ? <Loader2 className="h-4 w-4 animate-spin text-bhor-text-muted" aria-hidden /> : null}
            <span className={quoting ? "opacity-60" : ""}>{formatPaise(count === 0 ? 0 : totalPaise ?? 0)}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={onProceed}
          disabled={!canCheckout}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white transition-colors hover:bg-bhor-primary-dark disabled:cursor-not-allowed disabled:bg-bhor-border disabled:text-bhor-text-muted"
        >
          {proceedLabel}
          {canCheckout ? <ArrowRight className="h-4 w-4" aria-hidden /> : null}
        </button>
        <p className="text-center text-bhor-caption leading-bhor-body text-bhor-text-muted">
          Delivery slot, offers and payment — online or pay on delivery where available — are chosen at checkout.
        </p>
      </div>
    </section>
  );
}
