"use client";

import { useState } from "react";
import { AlertCircle, BadgeCheck, X } from "lucide-react";
import { applyCoupon, type AppliedCoupon } from "@/src/lib/api/coupon.api";
import { ApiClientError } from "@/src/lib/api/client";

/**
 * The Apply Coupon control, sized to sit inside the Order Summary card.
 *
 * It lives beside the totals rather than in its own section because that is
 * where the number it changes appears — applying a code and watching the total
 * move should not involve looking at two different parts of the page. Nothing
 * here carries card chrome of its own; the summary provides it.
 *
 * The code is checked by the server, which answers with a percentage. This
 * component never decides whether a coupon is valid, and the figure it helps
 * display is a preview — the order is priced again from catalogue prices when
 * it is created.
 */
export function CouponField({
  applied,
  onApplied,
  onRemoved,
}: {
  applied: AppliedCoupon | null;
  onApplied: (coupon: AppliedCoupon) => void;
  onRemoved: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  async function submit() {
    const entered = code.trim();
    if (!entered) {
      setError("Enter a coupon code");
      return;
    }

    setIsApplying(true);
    setError("");

    try {
      const coupon = await applyCoupon(entered);
      onApplied(coupon);
      setCode("");
    } catch (caught) {
      setError(
        caught instanceof ApiClientError ? caught.message : "Couldn't check that code. Please try again.",
      );
    } finally {
      setIsApplying(false);
    }
  }

  if (applied) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-bhor-sm border border-bhor-success/40 bg-bhor-success/10 px-3 py-2.5">
        <p className="flex min-w-0 items-center gap-2 text-bhor-caption font-bhor-semibold text-bhor-success">
          <BadgeCheck className="h-4 w-4 shrink-0" aria-hidden />
          <span className="truncate">{applied.code} applied</span>
        </p>
        <button
          type="button"
          onClick={onRemoved}
          aria-label={`Remove coupon ${applied.code}`}
          className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-bhor-sm px-2 text-bhor-caption font-bhor-bold uppercase text-bhor-text-muted transition-colors hover:text-bhor-primary"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
          Remove
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(event) => {
            // Upper-cased as it is typed, matching how the server stores codes,
            // so what is on screen is what will be checked.
            setCode(event.target.value.toUpperCase());
            if (error) setError("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") void submit();
          }}
          maxLength={24}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Coupon code"
          aria-invalid={Boolean(error)}
          placeholder="Coupon code"
          className={`min-h-10 w-full min-w-0 flex-1 rounded-bhor-sm border bg-bhor-cream px-3 text-bhor-caption uppercase tracking-wide text-bhor-text outline-none focus:border-bhor-primary ${
            error ? "border-bhor-error" : "border-bhor-border"
          }`}
        />
        <button
          type="button"
          onClick={() => void submit()}
          disabled={isApplying}
          className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-bhor-sm border border-bhor-primary px-4 text-bhor-caption font-bhor-bold uppercase text-bhor-primary transition-colors hover:bg-bhor-primary hover:text-white disabled:opacity-70"
        >
          {isApplying ? "…" : "Apply"}
        </button>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-2 flex items-start gap-1.5 text-bhor-caption font-bhor-medium text-bhor-error"
        >
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
    </div>
  );
}
