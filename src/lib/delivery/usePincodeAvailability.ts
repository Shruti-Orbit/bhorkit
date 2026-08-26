"use client";

import { useEffect, useState } from "react";
import { checkPincode } from "@/src/lib/api/delivery.api";

export type AvailabilityState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available"; pincode: string }
  | { status: "unavailable"; pincode: string; message: string };

type Result = { pincode: string; serviceable: boolean; message: string };

/**
 * Live delivery-coverage feedback for a pincode as the user types it.
 *
 * Used by the address form so it asks the same question, of the same endpoint,
 * as the product page checker and gets the same wording. It is feedback only —
 * the server re-checks on address save and again at checkout, so a stale,
 * skipped or failed result here can never let an undeliverable order through.
 *
 * The visible state is DERIVED from the last result and the current input
 * rather than synced into state by the effect: the effect only ever writes the
 * outcome of a completed request, so a slow reply for an earlier pincode can be
 * ignored by comparing what it describes against what is in the box now, and
 * there is no synchronous setState cascading a render.
 */
export function usePincodeAvailability(pincode: string): AvailabilityState {
  const [result, setResult] = useState<Result | null>(null);
  const trimmed = pincode.replace(/[\s-]/g, "").trim();
  const complete = /^[1-9]\d{5}$/.test(trimmed);

  useEffect(() => {
    if (!complete) return;

    let active = true;
    // Short debounce: the last digit is usually followed straight away by the
    // next field, and firing per keystroke would request prefixes nobody waits
    // on.
    const timer = setTimeout(() => {
      checkPincode(trimmed)
        .then((response) => {
          if (!active) return;
          setResult({
            pincode: trimmed,
            serviceable: response.serviceable,
            message: response.message ?? "We're currently not available at this location.",
          });
        })
        .catch(() => {
          // A failed check must not present as "unavailable" — that would tell
          // a customer we don't deliver to them because the network blipped.
          // Leaving it pending is safe: saving and checkout are both gated
          // server-side anyway.
        });
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [trimmed, complete]);

  if (!complete) return { status: "idle" };
  // A result for a different pincode is a stale reply, so the box still counts
  // as being checked.
  if (result?.pincode !== trimmed) return { status: "checking" };
  return result.serviceable
    ? { status: "available", pincode: trimmed }
    : { status: "unavailable", pincode: trimmed, message: result.message };
}
