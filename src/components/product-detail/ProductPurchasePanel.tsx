"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Flame, MapPin } from "lucide-react";
import type { CollectionProduct } from "@/src/data/products";

type DeliveryStatus = "idle" | "two-hour" | "standard" | "unavailable";
type PurchaseMode = "now" | "later";

type ProductPurchasePanelProps = {
  product: CollectionProduct;
};

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const [pincode, setPincode] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>("idle");
  const [selectedMode, setSelectedMode] = useState<PurchaseMode>("now");

  const canCheckTwoHour = product.stock.readyStock && product.delivery.supportsTwoHourDelivery;

  const orderNowText = useMemo(() => {
    if (deliveryStatus === "two-hour") {
      return "Receive within 2 hours";
    }

    if (!product.stock.readyStock) {
      return "Ready stock currently unavailable";
    }

    return "Check pincode for fastest delivery";
  }, [deliveryStatus, product.stock.readyStock]);

  function checkDelivery() {
    const normalizedPincode = pincode.trim();

    if (!product.delivery.availablePincodes.includes(normalizedPincode)) {
      setDeliveryStatus("unavailable");
      return;
    }

    if (
      canCheckTwoHour &&
      product.delivery.twoHourEligiblePincodes.includes(normalizedPincode)
    ) {
      setDeliveryStatus("two-hour");
      return;
    }

    setDeliveryStatus("standard");
  }

  return (
    <section className="rounded-bhor-md border border-bhor-border bg-bhor-surface p-4">
      <p className="flex items-center gap-2 text-bhor-small font-bhor-semibold text-bhor-text">
        <MapPin className="h-4 w-4 text-bhor-primary" aria-hidden />
        Delivering in Patna
      </p>

      <div className="mt-3 flex gap-2">
        <input
          value={pincode}
          onChange={(event) => {
            setPincode(event.target.value);
            setDeliveryStatus("idle");
          }}
          inputMode="numeric"
          maxLength={6}
          placeholder="Enter your pincode"
          className="min-h-11 min-w-0 flex-1 rounded-bhor-sm border border-bhor-border bg-bhor-surface px-3 text-bhor-small text-bhor-text outline-none focus:border-bhor-primary"
        />
        <button
          type="button"
          onClick={checkDelivery}
          className="min-h-11 rounded-bhor-sm bg-bhor-primary px-4 text-bhor-button-mobile font-bhor-semibold text-white hover:bg-bhor-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
        >
          Check
        </button>
      </div>

      <DeliveryMessage status={deliveryStatus} />

      <div className="mt-5 grid gap-3">
        <Link
          href={deliveryStatus === "unavailable" || !product.stock.readyStock ? "#" : "/checkout"}
          aria-disabled={deliveryStatus === "unavailable" || !product.stock.readyStock}
          onClick={(event) => {
            setSelectedMode("now");
            if (deliveryStatus === "unavailable" || !product.stock.readyStock) {
              event.preventDefault();
            }
          }}
          className={`group rounded-bhor-md border p-4 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary ${
            selectedMode === "now"
              ? "border-bhor-primary bg-bhor-primary text-white"
              : "border-bhor-border bg-bhor-cream text-bhor-text hover:border-bhor-primary"
          }`}
        >
          <span className="flex items-center justify-between gap-3">
            <span className="text-bhor-button font-bhor-bold uppercase">Order Now</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </span>
          <span
            className={`mt-2 flex items-center gap-2 text-bhor-small font-bhor-medium ${
              selectedMode === "now" ? "text-white/85" : "text-bhor-text-muted"
            }`}
          >
            <Clock className="h-4 w-4" aria-hidden />
            {orderNowText}
          </span>
        </Link>

        <Link
          href="/pre-order"
          onClick={() => setSelectedMode("later")}
          className={`rounded-bhor-md border p-4 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary ${
            selectedMode === "later"
              ? "border-bhor-primary bg-bhor-primary-soft"
              : "border-bhor-primary bg-bhor-surface hover:bg-bhor-primary-soft"
          }`}
        >
          <span className="flex items-center justify-between gap-3 text-bhor-primary">
            <span className="text-bhor-button font-bhor-bold uppercase">Order For Later</span>
            <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
          <span className="mt-2 flex items-center gap-2 text-bhor-small font-bhor-semibold text-bhor-text">
            <Flame className="h-4 w-4 text-bhor-gold" aria-hidden />
            Reserve now • Delivery before Ganesh Chaturthi
          </span>
        </Link>
      </div>

      {selectedMode === "later" ? (
        <div className="mt-4 rounded-bhor-sm bg-bhor-primary-soft p-3">
          <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-primary">
            Ganesh Chaturthi Pre-Order
          </p>
          <p className="mt-1 text-bhor-small leading-bhor-body text-bhor-text">
            Reserve your kit now and receive it before Ganesh Chaturthi.
          </p>
        </div>
      ) : null}

      <p className="mt-3 text-bhor-caption leading-bhor-body text-bhor-text-muted">
        *2-hour delivery available only for eligible Patna locations and in-stock products.
      </p>
    </section>
  );
}

function DeliveryMessage({ status }: { status: DeliveryStatus }) {
  if (status === "two-hour") {
    return (
      <p className="mt-2 text-bhor-small font-bhor-medium text-bhor-success">
        ✓ 2-hour delivery available in your area
      </p>
    );
  }

  if (status === "standard") {
    return (
      <p className="mt-2 text-bhor-small font-bhor-medium text-bhor-success">
        ✓ Standard delivery available in your area
      </p>
    );
  }

  if (status === "unavailable") {
    return (
      <p className="mt-2 text-bhor-small font-bhor-medium text-bhor-primary">
        × Delivery currently unavailable at this pincode
      </p>
    );
  }

  return null;
}
