"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import { OrderSummary } from "@/src/components/cart/OrderSummary";
import { CheckoutAuth } from "@/src/components/checkout/CheckoutAuth";
import { CheckoutDeliveryMode } from "@/src/components/checkout/CheckoutDeliveryMode";
import { DeliveryAddressSection } from "@/src/components/checkout/DeliveryAddressSection";
import { useShop } from "@/src/context/ShopContext";

export default function CheckoutPage() {
  const { addresses, cartItems, checkoutMode, createOrder, isLoggedIn, scheduledDeliveryDate, scheduledDeliverySlot } = useShop();
  const router = useRouter();
  const canPlaceOrder =
    isLoggedIn &&
    cartItems.length > 0 &&
    addresses.length > 0 &&
    (checkoutMode !== "scheduled" || (scheduledDeliveryDate && scheduledDeliverySlot));

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
                  Payment
                </h2>
                <p className="mt-2 text-bhor-small text-bhor-text-muted">
                  Payment UI is frontend-only for now and will be connected later.
                </p>
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
                  : checkoutMode === "scheduled" && (!scheduledDeliveryDate || !scheduledDeliverySlot)
                    ? "Select Delivery Slot"
                    : "Place Order"}
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
