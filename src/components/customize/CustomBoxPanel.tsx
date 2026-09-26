"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRight, BadgeCheck, Info, Loader2, PackageOpen, X } from "lucide-react";
import { MAX_OCCASION_LENGTH } from "@/src/lib/customization/customBoxStore";
import { formatPaise } from "@/src/utils/money";
import { ItemPhoto } from "./CustomizeItemTile";
import { QuantityStepper } from "./QuantityStepper";

export type BoxPanelLine = {
  id: string;
  /** Null while the item list is still loading. */
  name: string | null;
  pack: string;
  quantity: number;
  /** The item's photo, or null when it has none or the catalogue is still loading. */
  image: string | null;
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
  const reached = remaining === 0 && count > 0;

  const proceedLabel =
    remaining > 0
      ? `Add ${remaining} more item${remaining === 1 ? "" : "s"}`
      : quoting
        ? "Updating total…"
        : "Proceed to checkout";

  return (
    <section
      aria-labelledby={headingId}
      className={inSheet ? "bg-white" : "overflow-hidden rounded-xl border border-[#ECE3D8] bg-white shadow-[0_12px_32px_-20px_rgb(36_26_28/0.3)]"}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
        <div>
          <h2 id={headingId} className="text-bhor-product font-bhor-bold text-bhor-text">
            Your puja box
          </h2>
          <p className="text-bhor-caption text-bhor-text-muted">
            {count === 0 ? "No items yet" : `${count} item${count === 1 ? "" : "s"} · ${packs} pack${packs === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {count > 0 && !confirmingClear ? (
            <button
              type="button"
              onClick={() => setConfirmingClear(true)}
              className="rounded-md px-2 py-1 text-bhor-caption font-bhor-semibold text-bhor-primary underline-offset-2 hover:underline"
            >
              Clear all
            </button>
          ) : null}
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close your box"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4EDE4] text-bhor-text transition-colors hover:bg-[#EADFD2]"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>

      {confirmingClear ? (
        <div className="mx-4 mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#F1D5D2] bg-[#FDF3F2] px-3 py-2.5 sm:mx-5">
          <p className="text-bhor-small font-bhor-semibold text-bhor-text">Remove all {count} items?</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmingClear(false)}
              className="h-8 rounded-md border border-[#E3D9CD] bg-white px-3 text-bhor-caption font-bhor-bold text-bhor-text"
            >
              Keep
            </button>
            <button
              type="button"
              onClick={() => {
                onClear();
                setConfirmingClear(false);
              }}
              className="h-8 rounded-md bg-bhor-error px-3 text-bhor-caption font-bhor-bold text-white"
            >
              Clear box
            </button>
          </div>
        </div>
      ) : null}

      {/* Minimum-items meter */}
      <div className={`border-y px-4 py-3 sm:px-5 ${reached ? "border-[#DCE6D8] bg-[#F1F6EF]" : "border-[#F0E6DA] bg-[#FBF6EF]"}`}>
        <div className="flex items-center justify-between gap-3">
          <p className={`flex items-center gap-1.5 text-bhor-caption font-bhor-semibold ${reached ? "text-bhor-success" : "text-bhor-text"}`}>
            {reached ? <BadgeCheck className="h-4 w-4" aria-hidden /> : null}
            {count === 0
              ? `Add at least ${minItems} different items`
              : remaining > 0
                ? `Add ${remaining} more item${remaining === 1 ? "" : "s"} to checkout`
                : "Minimum reached — you're good to go"}
          </p>
          <p className="text-bhor-caption font-bhor-bold tabular-nums text-bhor-text-muted">
            {Math.min(count, minItems)}/{minItems}
          </p>
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EADFD2]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={minItems}
          aria-valuenow={Math.min(count, minItems)}
          aria-label="Items in your box"
        >
          <div
            className={`h-full rounded-full transition-[width] duration-300 ${reached ? "bg-bhor-success" : "bg-bhor-primary"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="px-4 py-3 sm:px-5">
        {count === 0 ? (
          <div className="flex flex-col items-center px-4 py-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F6EEE3]">
              <PackageOpen className="h-8 w-8 text-bhor-gold" strokeWidth={1.5} aria-hidden />
            </span>
            <p className="mt-3 text-bhor-small font-bhor-bold text-bhor-text">Your box is empty</p>
            <p className="mt-1 max-w-[16rem] text-bhor-caption leading-bhor-body text-bhor-text-muted">
              Tap the items you need to add them. Pick at least {minItems} different items for your puja.
            </p>
          </div>
        ) : (
          <ul className={`divide-y divide-[#F0E8DE] overflow-y-auto ${inSheet ? "" : "max-h-[36vh]"}`}>
            {lines.map((line) => (
              <li key={line.id} className="flex items-center gap-3 py-2.5">
                <ItemPhoto
                  src={line.image}
                  sizes="48px"
                  className="h-12 w-12 shrink-0 rounded-lg border border-[#ECE3D8]"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-bhor-small font-bhor-semibold capitalize text-bhor-text">
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

        <label className="mt-3 block">
          <span className="text-bhor-caption font-bhor-semibold text-bhor-text">
            Which puja is this for? <span className="font-bhor-regular text-bhor-text-muted">(optional)</span>
          </span>
          <input
            value={occasion}
            onChange={(event) => onOccasion(event.target.value)}
            maxLength={MAX_OCCASION_LENGTH}
            placeholder="e.g. Satyanarayan Puja, Griha Pravesh"
            className="mt-1.5 h-11 w-full rounded-lg border border-[#E3D9CD] bg-white px-3 text-bhor-small text-bhor-text outline-none transition-colors placeholder:text-bhor-text-muted/60 focus:border-bhor-primary focus:ring-2 focus:ring-bhor-primary/15"
          />
        </label>
      </div>

      <div className="space-y-3 border-t border-[#F0E8DE] bg-[#FDFBF8] px-4 pb-4 pt-3 sm:px-5">
        {notice ? (
          <div role="status" className="flex items-start gap-2 rounded-lg bg-bhor-peach px-3 py-2 text-bhor-caption font-bhor-semibold text-bhor-primary-dark">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p className="flex-1">{notice}</p>
            <button type="button" onClick={onDismissNotice} aria-label="Dismiss" className="shrink-0">
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ) : null}

        {quoteError ? (
          <p role="alert" className="flex items-start gap-2 rounded-lg bg-[#FDF3F2] px-3 py-2 text-bhor-caption font-bhor-semibold text-bhor-error">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {quoteError}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <p className="text-bhor-small font-bhor-semibold text-bhor-text">Box total</p>
          <p className="flex items-center gap-2 text-bhor-product font-bhor-bold text-bhor-text" aria-live="polite">
            {quoting && count > 0 ? <Loader2 className="h-4 w-4 animate-spin text-bhor-text-muted" aria-hidden /> : null}
            <span className={`tabular-nums ${quoting ? "opacity-50" : ""}`}>{formatPaise(count === 0 ? 0 : totalPaise ?? 0)}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={onProceed}
          disabled={!canCheckout}
          className="inline-flex h-12 w-full items-center justify-between gap-2 rounded-lg bg-bhor-primary px-4 text-bhor-button font-bhor-bold text-white transition-colors hover:bg-bhor-primary-dark disabled:cursor-not-allowed disabled:justify-center disabled:bg-[#E7DDD1] disabled:text-bhor-text-muted"
        >
          {canCheckout ? (
            <>
              <span className="tabular-nums">{formatPaise(totalPaise ?? 0)}</span>
              <span className="inline-flex items-center gap-1.5">
                {proceedLabel}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </>
          ) : (
            proceedLabel
          )}
        </button>
        <p className="text-center text-bhor-caption leading-bhor-body text-bhor-text-muted">
          Delivery slot, offers and payment online or pay on delivery where available are chosen at checkout.
        </p>
      </div>
    </section>
  );
}
