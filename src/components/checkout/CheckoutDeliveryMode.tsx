"use client";

import { CalendarDays, Truck } from "lucide-react";
import { useShop } from "@/src/context/ShopContext";
import {
  ganeshPreOrderMinDate,
  ganeshPreOrderMinDateLabel,
  isValidGaneshPreOrderDate,
} from "@/src/utils/preorder";

const slots = ["9 AM - 12 PM", "12 PM - 3 PM", "3 PM - 6 PM", "6 PM - 9 PM"];

export function CheckoutDeliveryMode() {
  const {
    cartItems,
    checkoutMode,
    isLoggedIn,
    scheduledDeliveryDate,
    scheduledDeliverySlot,
    setScheduledDeliveryDate,
    setScheduledDeliverySlot,
  } = useShop();
  const preorder = cartItems[0]?.product.preorder;

  if (!isLoggedIn) {
    return null;
  }

  if (checkoutMode === "buy-now") {
    return (
      <section className="rounded-bhor-lg border border-bhor-border bg-bhor-surface p-5 shadow-bhor-soft">
        <h2 className="flex items-center gap-2 text-bhor-product font-bhor-bold text-bhor-text">
          <Truck className="h-5 w-5 text-bhor-gold" aria-hidden />
          Earliest Available Delivery
        </h2>
        <p className="mt-2 text-bhor-small text-bhor-text-muted">
          We&apos;ll prepare your order for the earliest available delivery window.
        </p>
      </section>
    );
  }

  if (checkoutMode === "pre-order") {
    return (
      <section className="rounded-bhor-lg border border-bhor-border bg-bhor-surface p-5 shadow-bhor-soft">
        <h2 className="flex items-center gap-2 text-bhor-product font-bhor-bold text-bhor-text">
          <CalendarDays className="h-5 w-5 text-bhor-gold" aria-hidden />
          Pre-Order Product
        </h2>
        <p className="mt-2 text-bhor-small text-bhor-text-muted">
          Expected Delivery / Dispatch: {preorder?.expectedDelivery ?? "To be confirmed"}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-bhor-lg border border-bhor-border bg-bhor-surface p-5 shadow-bhor-soft">
      <h2 className="flex items-center gap-2 text-bhor-product font-bhor-bold text-bhor-text">
        <CalendarDays className="h-5 w-5 text-bhor-gold" aria-hidden />
        Pre-Order Item
      </h2>
      <p className="mt-2 text-bhor-small text-bhor-text-muted">
        Your BHORKIT will be prepared and delivered before Ganesh Chaturthi. Select {ganeshPreOrderMinDateLabel} or any later date.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">
            Pre-Order Delivery Date
          </span>
          <input
            type="date"
            min={ganeshPreOrderMinDate}
            value={scheduledDeliveryDate}
            onChange={(event) => setScheduledDeliveryDate(event.target.value)}
            className={`mt-2 min-h-11 w-full rounded-bhor-sm border bg-bhor-cream px-3 text-bhor-small text-bhor-text outline-none focus:border-bhor-primary ${
              scheduledDeliveryDate && !isValidGaneshPreOrderDate(scheduledDeliveryDate)
                ? "border-bhor-primary"
                : "border-bhor-border"
            }`}
          />
          {scheduledDeliveryDate && !isValidGaneshPreOrderDate(scheduledDeliveryDate) ? (
            <span className="mt-2 block text-bhor-caption font-bhor-semibold text-bhor-primary">
              Please select {ganeshPreOrderMinDateLabel} or a later date.
            </span>
          ) : null}
        </label>
        <label className="block">
          <span className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">
            Pre-Order Delivery Time
          </span>
          <select
            value={scheduledDeliverySlot}
            onChange={(event) => setScheduledDeliverySlot(event.target.value)}
            className="mt-2 min-h-11 w-full rounded-bhor-sm border border-bhor-border bg-bhor-cream px-3 text-bhor-small text-bhor-text outline-none focus:border-bhor-primary"
          >
            <option value="">Select Time Slot</option>
            {slots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
