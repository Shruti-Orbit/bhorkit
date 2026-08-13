"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import type { CollectionProduct } from "@/src/data/products";

type DeliveryCheckerProps = {
  delivery: CollectionProduct["delivery"];
};

export function DeliveryChecker({ delivery }: DeliveryCheckerProps) {
  const [pincode, setPincode] = useState("");
  const [status, setStatus] = useState<"idle" | "available" | "unavailable">("idle");

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
            setPincode(event.target.value);
            setStatus("idle");
          }}
          inputMode="numeric"
          maxLength={6}
          placeholder="Enter your pincode"
          className="min-h-11 min-w-0 flex-1 rounded-bhor-sm border border-bhor-border bg-bhor-surface px-3 text-bhor-small text-bhor-text outline-none focus:border-bhor-primary"
        />
        <button
          type="button"
          onClick={() => {
            setStatus(delivery.availablePincodes.includes(pincode) ? "available" : "unavailable");
          }}
          className="min-h-11 rounded-bhor-sm bg-bhor-primary px-4 text-bhor-button-mobile font-bhor-semibold text-white hover:bg-bhor-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
        >
          Check
        </button>
      </div>
      {status === "available" ? (
        <p className="mt-2 text-bhor-small font-bhor-medium text-bhor-success">
          Delivery available in your area
        </p>
      ) : null}
      {status === "unavailable" ? (
        <p className="mt-2 text-bhor-small font-bhor-medium text-bhor-primary">
          This product is currently unavailable at this pincode.
        </p>
      ) : null}
    </div>
  );
}
