"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, Loader2, Lock, ShieldCheck } from "lucide-react";
import { OrderSummary } from "@/src/components/cart/OrderSummary";
import { CheckoutAuth } from "@/src/components/checkout/CheckoutAuth";
import { DeliveryAddressSection } from "@/src/components/checkout/DeliveryAddressSection";
import { DeliveryScheduleSection } from "@/src/components/checkout/DeliveryScheduleSection";
import { useShop } from "@/src/context/ShopContext";
import { useCheckout } from "@/src/lib/checkout/useCheckout";
import { formatCurrency } from "@/src/utils/discount";

export default function CheckoutPage() {
  const {
    addresses,
    cartItems,
    cartTotal,
    checkoutMode,
    isLoggedIn,
    refreshOrders,
    selectedAddressId,
  } = useShop();

  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliverySlotId, setDeliverySlotId] = useState("");

  // Pre-order carts deliver in the Ganesh Chaturthi window; everything else
  // uses the standard next-14-days window. The server enforces the same rule.
  const deliveryMode = checkoutMode === "buy-now" ? "standard" : "scheduled";

  const { phase, error, notice, isBusy, startCheckout } = useCheckout({
    // The order now exists server-side, so pull the authoritative list rather
    // than optimistically inventing a local one.
    onOrderConfirmed: () => refreshOrders(),
  });

  const isPreOrder = deliveryMode === "scheduled";
  const canPay =
    isLoggedIn &&
    cartItems.length > 0 &&
    Boolean(selectedAddressId) &&
    Boolean(deliveryDate) &&
    Boolean(deliverySlotId) &&
    (!isPreOrder || policyAccepted) &&
    !isBusy;

  function pay() {
    if (!canPay) return;
    void startCheckout({
      addressId: selectedAddressId,
      deliveryMode,
      deliveryDate,
      deliverySlotId,
    });
  }

  return (
    <main className="flex flex-1 flex-col bg-bhor-cream px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-[1512px] gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-5">
          <div>
            <h1 className="font-bhor-display text-bhor-h2-mobile font-bhor-semibold text-bhor-text md:text-bhor-h2">
              Checkout
            </h1>
            <p className="mt-2 flex items-center gap-2 text-bhor-small text-bhor-text-muted">
              <Lock className="h-4 w-4 text-bhor-success" aria-hidden />
              Payments are processed securely by Razorpay.
            </p>
          </div>

          {cartItems.length === 0 ? (
            <div className="rounded-bhor-lg border border-bhor-border bg-bhor-surface p-8 text-center">
              <p className="text-bhor-body font-bhor-semibold text-bhor-text">Your cart is empty.</p>
              <Link
                href="/"
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              <CheckoutAuth />

              <DeliveryAddressSection />

              {isLoggedIn ? (
                <DeliveryScheduleSection
                  mode={deliveryMode}
                  date={deliveryDate}
                  slotId={deliverySlotId}
                  onDateChange={setDeliveryDate}
                  onSlotChange={setDeliverySlotId}
                />
              ) : null}

              {isPreOrder ? (
                <section className="rounded-bhor-lg border border-bhor-border bg-bhor-surface p-5 shadow-bhor-soft">
                  <h2 className="flex items-center gap-2 text-bhor-product font-bhor-bold text-bhor-text">
                    <AlertTriangle className="h-5 w-5 text-bhor-primary" aria-hidden />
                    Pre-Order Policy
                  </h2>
                  <p className="mt-2 text-bhor-small leading-bhor-body text-bhor-text-muted">
                    Once your pre-order is confirmed and payment is completed, it cannot be cancelled or refunded.
                  </p>
                  <label className="mt-4 flex gap-3 rounded-bhor-sm border border-bhor-border bg-bhor-cream p-3 text-bhor-small font-bhor-semibold leading-bhor-body text-bhor-text">
                    <input
                      type="checkbox"
                      checked={policyAccepted}
                      onChange={(event) => setPolicyAccepted(event.target.checked)}
                      className="mt-1 h-4 w-4 accent-bhor-primary"
                    />
                    <span>
                      I understand that this is a pre-order and that payment is non-refundable and the order
                      cannot be cancelled after payment.
                    </span>
                  </label>
                </section>
              ) : null}
            </>
          )}
        </section>

        {cartItems.length > 0 ? (
          <div className="space-y-4">
            <OrderSummary />

            {error ? (
              <p
                role="alert"
                className="rounded-bhor-sm border border-bhor-error bg-bhor-peach px-4 py-3 text-bhor-small font-bhor-semibold leading-bhor-body text-bhor-error"
              >
                {error}
              </p>
            ) : null}

            {notice ? (
              <p className="rounded-bhor-sm border border-bhor-border bg-bhor-surface px-4 py-3 text-bhor-small font-bhor-semibold leading-bhor-body text-bhor-text-muted">
                {notice}
              </p>
            ) : null}

            <button
              type="button"
              disabled={!canPay}
              onClick={pay}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white transition-colors hover:bg-bhor-primary-dark disabled:bg-bhor-border disabled:text-bhor-text-muted"
            >
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {payButtonLabel()}
            </button>

            <p className="flex items-center justify-center gap-2 text-bhor-caption font-bhor-medium text-bhor-text-muted">
              <ShieldCheck className="h-4 w-4 text-bhor-success" aria-hidden />
              UPI · Cards · Net Banking · Wallets
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );

  function payButtonLabel() {
    if (phase === "creating") return "Starting secure payment…";
    if (phase === "awaiting_payment") return "Complete payment in the window";
    if (phase === "verifying") return "Confirming your payment…";
    if (phase === "resuming") return "Checking payment status…";
    if (!isLoggedIn) return "Login to Continue";
    if (addresses.length === 0 || !selectedAddressId) return "Add Address to Continue";
    if (!deliveryDate || !deliverySlotId) return "Select Delivery Date & Slot";
    if (isPreOrder && !policyAccepted) return "Accept Pre-Order Policy";
    return `Pay ${formatCurrency(cartTotal)}`;
  }
}
