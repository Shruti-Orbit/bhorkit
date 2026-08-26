"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import type { CollectionProduct } from "@/src/data/products";
import { checkPincode } from "@/src/lib/api/delivery.api";

type DeliveryCheckerProps = {
  /** Kept for the copy above the field; coverage itself comes from the API. */
  delivery: CollectionProduct["delivery"];
};

type Status =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "available" }
  | { kind: "unavailable"; message: string };

/**
 * Asks the server whether we deliver to a pincode.
 *
 * It used to test the pincode against a list embedded in each product, which
 * meant coverage was duplicated per product, shipped to the browser, and could
 * disagree with what checkout would actually accept. It now calls the same
 * endpoint the address form uses, so the answer here is the answer at checkout.
 */
export function DeliveryChecker({ delivery }: DeliveryCheckerProps) {
  void delivery;
  const [pincode, setPincode] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function check() {
    setStatus({ kind: "checking" });
    try {
      const result = await checkPincode(pincode);
      setStatus(
        result.serviceable
          ? { kind: "available" }
          : { kind: "unavailable", message: result.message ?? "We're currently not available at this location." },
      );
    } catch {
      setStatus({ kind: "unavailable", message: "Couldn't check right now. Please try again." });
    }
  }

  return (
    <div className="rounded-bhor-md border border-bhor-border bg-bhor-surface p-4">
      <p className="flex items-center gap-2 text-bhor-small font-bhor-semibold text-bhor-text">
        <MapPin className="h-4 w-4 text-bhor-primary" aria-hidden />
        Delivering in Patna
      </p>
      <div className="mt-3 flex gap-2">
        <input
          value={pincode}
          onChange={(event) => {
            setPincode(event.target.value.replace(/[^\d]/g, "").slice(0, 6));
            setStatus({ kind: "idle" });
          }}
          inputMode="numeric"
          maxLength={6}
          placeholder="Enter your pincode"
          className="min-h-11 min-w-0 flex-1 rounded-bhor-sm border border-bhor-border bg-bhor-surface px-3 text-bhor-small text-bhor-text outline-none focus:border-bhor-primary"
        />
        <button
          type="button"
          onClick={check}
          disabled={pincode.length !== 6 || status.kind === "checking"}
          className="min-h-11 rounded-bhor-sm bg-bhor-primary px-4 text-bhor-button-mobile font-bhor-semibold text-white hover:bg-bhor-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary disabled:opacity-50"
        >
          {status.kind === "checking" ? "Checking…" : "Check"}
        </button>
      </div>
      {status.kind === "available" ? (
        <p className="mt-2 text-bhor-small font-bhor-medium text-bhor-success">
          Delivery available in your area
        </p>
      ) : null}
      {status.kind === "unavailable" ? (
        <p role="alert" className="mt-2 text-bhor-small font-bhor-medium text-bhor-primary">
          {status.message}
        </p>
      ) : null}
    </div>
  );
}
