"use client";

import { Banknote, CreditCard } from "lucide-react";
import type { PaymentMode, PaymentOptions } from "@/src/lib/api/order.api";
import { formatPaise } from "@/src/utils/money";

type PaymentMethodSectionProps = {
  value: PaymentMode;
  onChange: (mode: PaymentMode) => void;
  /** Null while loading, or if the options could not be fetched — pay on delivery is then not offered. */
  options: PaymentOptions | null;
  loading: boolean;
};

/**
 * Online payment or pay on delivery.
 *
 * Whether pay on delivery can be chosen — and what it costs — comes from the
 * server, which checks every product, the settings and the order total. The
 * choice is only a request: the order is checked against the same rule again
 * when it is placed.
 */
export function PaymentMethodSection({ value, onChange, options, loading }: PaymentMethodSectionProps) {
  const cod = options?.payOnDelivery ?? null;
  const codAvailable = Boolean(cod?.available);

  const codDetail = loading
    ? "Checking availability…"
    : !cod
      ? "Pay on delivery isn't available right now."
      : !cod.available
        ? cod.reason ?? "Pay on delivery isn't available for this order."
        : cod.feePaise > 0
          ? `Pay by UPI QR or cash when your order arrives · ${formatPaise(cod.feePaise)} extra`
          : "Pay by UPI QR or cash when your order arrives · no extra charge";

  return (
    <section className="rounded-bhor-lg border border-bhor-border bg-bhor-surface p-5 shadow-bhor-soft">
      <h2 className="text-bhor-product font-bhor-bold text-bhor-text">Payment Method</h2>

      <div role="radiogroup" aria-label="Payment method" className="mt-4 space-y-3">
        <label
          className={`flex cursor-pointer gap-3 rounded-bhor-md border p-4 ${
            value === "online" ? "border-bhor-primary bg-bhor-primary-soft" : "border-bhor-border"
          }`}
        >
          <input
            type="radio"
            name="payment-method"
            checked={value === "online"}
            onChange={() => onChange("online")}
            className="mt-1 h-4 w-4 shrink-0 accent-bhor-primary"
          />
          <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-bhor-primary" aria-hidden />
          <span className="min-w-0">
            <span className="block text-bhor-small font-bhor-bold text-bhor-text">Pay online</span>
            <span className="mt-0.5 block text-bhor-caption leading-bhor-body text-bhor-text-muted">
              UPI · Cards · Net Banking · Wallets ·{" "}
              <span className="font-bhor-semibold text-bhor-success">10% off</span>
            </span>
          </span>
        </label>

        <label
          className={`flex gap-3 rounded-bhor-md border p-4 ${
            !codAvailable
              ? "cursor-not-allowed border-bhor-border opacity-70"
              : value === "pay_on_delivery"
                ? "cursor-pointer border-bhor-primary bg-bhor-primary-soft"
                : "cursor-pointer border-bhor-border"
          }`}
        >
          <input
            type="radio"
            name="payment-method"
            checked={value === "pay_on_delivery"}
            disabled={!codAvailable}
            onChange={() => onChange("pay_on_delivery")}
            className="mt-1 h-4 w-4 shrink-0 accent-bhor-primary"
          />
          <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-bhor-primary" aria-hidden />
          <span className="min-w-0">
            <span className="block text-bhor-small font-bhor-bold text-bhor-text">Pay on delivery</span>
            <span
              className={`mt-0.5 block text-bhor-caption leading-bhor-body ${
                !loading && cod && !cod.available ? "text-bhor-error" : "text-bhor-text-muted"
              }`}
            >
              {codDetail}
            </span>
          </span>
        </label>
      </div>
    </section>
  );
}
