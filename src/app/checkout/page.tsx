"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CreditCard } from "lucide-react";
import { OrderSummary } from "@/src/components/cart/OrderSummary";
import { CheckoutAuth } from "@/src/components/checkout/CheckoutAuth";
import { CheckoutDeliveryMode } from "@/src/components/checkout/CheckoutDeliveryMode";
import { DeliveryAddressSection } from "@/src/components/checkout/DeliveryAddressSection";
import { useShop } from "@/src/context/ShopContext";
import { formatCurrency } from "@/src/utils/discount";
import { isValidGaneshPreOrderDate } from "@/src/utils/preorder";

export default function CheckoutPage() {
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const {
    addresses,
    cartItems,
    cartTotal,
    checkoutMode,
    createOrder,
    isLoggedIn,
    paymentMethod,
    scheduledDeliveryDate,
    scheduledDeliverySlot,
    setPaymentMethod,
  } = useShop();
  const router = useRouter();
  const canPlaceOrder =
    isLoggedIn &&
    cartItems.length > 0 &&
    addresses.length > 0 &&
    paymentMethod === "online" &&
    policyAccepted &&
    (checkoutMode !== "scheduled" ||
      (isValidGaneshPreOrderDate(scheduledDeliveryDate) && scheduledDeliverySlot));

  return (
    <main className="flex flex-1 flex-col bg-bhor-cream px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-[1512px] gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-5">
          <div>
            <h1 className="font-bhor-display text-bhor-h2-mobile font-bhor-semibold text-bhor-text md:text-bhor-h2">
              Checkout
            </h1>
            <p className="mt-2 text-bhor-small text-bhor-text-muted">
              Complete your details. No real payment is connected yet.
            </p>
          </div>

          {cartItems.length === 0 ? (
            <div className="rounded-bhor-lg border border-bhor-border bg-bhor-surface p-8 text-center">
              <p className="text-bhor-body font-bhor-semibold text-bhor-text">Your cart is empty.</p>
              <Link href="/" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              <CheckoutAuth />

              <DeliveryAddressSection />

              <CheckoutDeliveryMode />

              <section className="rounded-bhor-lg border border-bhor-border bg-bhor-surface p-5 shadow-bhor-soft">
                <h2 className="flex items-center gap-2 text-bhor-product font-bhor-bold text-bhor-text">
                  <CreditCard className="h-5 w-5 text-bhor-gold" aria-hidden />
                  Payment Method
                </h2>
                <p className="mt-2 text-bhor-small text-bhor-text-muted">
                  Select Online Payment to apply the 10% discount.
                </p>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("online")}
                  className={`mt-4 w-full rounded-bhor-sm border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary ${
                    paymentMethod === "online"
                      ? "border-bhor-primary bg-bhor-primary-soft"
                      : "border-bhor-border bg-bhor-cream hover:border-bhor-primary"
                  }`}
                >
                  <span className="block text-bhor-small font-bhor-bold text-bhor-text">
                    Online Payment
                  </span>
                  <span className="mt-1 block text-bhor-caption font-bhor-semibold text-bhor-text-muted">
                    UPI • Cards • Net Banking
                  </span>
                  <span className="mt-3 block text-bhor-small font-bhor-bold text-bhor-primary">
                    🎁 Get 10% OFF on Online Payment
                  </span>
                </button>
              </section>

              <section className="rounded-bhor-lg border border-bhor-border bg-bhor-surface p-5 shadow-bhor-soft">
                <h2 className="flex items-center gap-2 text-bhor-product font-bhor-bold text-bhor-text">
                  <AlertTriangle className="h-5 w-5 text-bhor-primary" aria-hidden />
                  ⚠️ Pre-Order Policy
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
                    I understand that this is a pre-order and that payment is non-refundable and the order cannot be cancelled after payment.
                  </span>
                </label>
              </section>
            </>
          )}
        </section>

        {cartItems.length > 0 ? (
          <div className="space-y-4">
            <OrderSummary />
            <button
              type="button"
              disabled={!canPlaceOrder}
              onClick={() => {
                const order = createOrder();
                if (order) {
                  router.push(`/account/orders/${order.id}`);
                }
              }}
              className="min-h-12 w-full rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white disabled:bg-bhor-border disabled:text-bhor-text-muted"
            >
              {!isLoggedIn
                ? "Login to Continue"
                : addresses.length === 0
                  ? "Add Address to Continue"
                    : checkoutMode === "scheduled" &&
                      (!isValidGaneshPreOrderDate(scheduledDeliveryDate) ||
                        !scheduledDeliverySlot)
                    ? "Select Pre-Order Date & Slot"
                    : checkoutMode === "scheduled"
                      ? paymentMethod === "online" && policyAccepted
                        ? `Confirm Pre-Order & Pay ${formatCurrency(cartTotal)}`
                        : "Confirm Pre-Order"
                    : "Place Order"}
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
