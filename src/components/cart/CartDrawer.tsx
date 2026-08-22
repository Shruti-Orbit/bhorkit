"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, Minus, Plus, ReceiptText, ShieldCheck, Trash2, X } from "lucide-react";
import { useShop } from "@/src/context/ShopContext";
import { formatCurrency, freeHandlingThreshold, parsePrice } from "@/src/utils/discount";
import { isPreOrderProduct } from "@/src/utils/productState";

export function CartDrawer() {
  const {
    cartDrawerOpen,
    cartItems,
    cartSubtotal,
    cartTotal,
    closeCartDrawer,
    handlingCharge,
    memberDiscount,
    removeFromCart,
    setCheckoutMode,
    updateCartItem,
  } = useShop();
  const hasPreOrderItems = cartItems.some((item) => isPreOrderProduct(item.product));

  if (!cartDrawerOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label="Cart">
      <button
        type="button"
        aria-label="Close cart"
        onClick={closeCartDrawer}
        className="absolute inset-0 bg-bhor-text/35"
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[430px] flex-col bg-bhor-cream shadow-bhor-soft">
        <div className="flex items-center justify-between border-b border-bhor-border bg-bhor-surface px-4 py-4">
          <div>
            <h2 className="text-bhor-product font-bhor-bold text-bhor-text">Your Cart</h2>
            <p className="text-bhor-caption text-bhor-text-muted">
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close cart"
            onClick={closeCartDrawer}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-bhor-border text-bhor-text hover:text-bhor-primary"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <h3 className="text-bhor-product font-bhor-bold text-bhor-text">Your cart is empty</h3>
            <p className="mt-2 text-bhor-small text-bhor-text-muted">
              Add Ganesh Chaturthi kits or puja essentials to continue.
            </p>
            <Link
              href="/"
              onClick={closeCartDrawer}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {memberDiscount > 0 ? (
                <div className="flex items-center justify-between rounded-bhor-md bg-bhor-primary-soft px-4 py-3 text-bhor-small font-bhor-bold text-bhor-primary">
                  <span>Your total savings</span>
                  <span>{formatCurrency(memberDiscount)}</span>
                </div>
              ) : null}

              <section className="rounded-bhor-lg bg-bhor-surface p-4 shadow-bhor-soft">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-bhor-primary-soft text-bhor-primary">
                    <Clock className="h-6 w-6" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-bhor-body font-bhor-bold text-bhor-text">
                      {hasPreOrderItems ? "Ganesh Chaturthi Pre-Order" : "Delivery"}
                    </h3>
                    <p className="text-bhor-small text-bhor-text-muted">
                      Shipment of {cartItems.reduce((total, item) => total + item.quantity, 0)} item
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <article key={item.product.id} className="flex gap-3">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-bhor-sm bg-bhor-peach">
                        <Image
                          src={item.product.image}
                          alt={item.product.imageAlt}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-bhor-small font-bhor-semibold text-bhor-text">
                          {item.product.name}
                        </p>
                        {isPreOrderProduct(item.product) ? (
                          <span className="mt-1 inline-flex rounded-bhor-sm bg-bhor-primary-soft px-2 py-0.5 text-bhor-badge font-bhor-bold uppercase text-bhor-primary">
                            Pre-Order
                          </span>
                        ) : null}
                        <p className="mt-1 text-bhor-small font-bhor-bold text-bhor-text">
                          {formatCurrency(parsePrice(item.product.price))}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end justify-between gap-2">
                        <div className="flex items-center overflow-hidden rounded-bhor-sm bg-bhor-primary text-white">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => updateCartItem(item.product.id, item.quantity - 1)}
                            className="flex h-8 w-8 items-center justify-center"
                          >
                            <Minus className="h-3.5 w-3.5" aria-hidden />
                          </button>
                          <span className="min-w-7 text-center text-bhor-caption font-bhor-bold">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => updateCartItem(item.product.id, item.quantity + 1)}
                            className="flex h-8 w-8 items-center justify-center"
                          >
                            <Plus className="h-3.5 w-3.5" aria-hidden />
                          </button>
                        </div>
                        <button
                          type="button"
                          aria-label="Remove item"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-bhor-primary"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-bhor-lg bg-bhor-surface p-4 shadow-bhor-soft">
                <h3 className="flex items-center gap-2 text-bhor-body font-bhor-bold text-bhor-text">
                  <ReceiptText className="h-5 w-5 text-bhor-primary" aria-hidden />
                  Bill details
                </h3>
                <div className="mt-4 space-y-3 text-bhor-small">
                  <Row label="Items total" value={formatCurrency(cartSubtotal)} />
                  <Row
                    label="Online Payment Discount (10%)"
                    value={`-${formatCurrency(memberDiscount)}`}
                    tone="success"
                  />
                  <Row
                    label="Handling charge"
                    value={handlingCharge === 0 ? "FREE" : formatCurrency(handlingCharge)}
                  />
                  {handlingCharge > 0 ? (
                    <p className="text-bhor-caption text-bhor-text-muted">
                      Free handling on orders above {formatCurrency(freeHandlingThreshold)}.
                    </p>
                  ) : null}
                  <div className="border-t border-bhor-border pt-3">
                    <Row label="Grand total" value={formatCurrency(cartTotal)} strong />
                  </div>
                </div>
              </section>

              <section className="rounded-bhor-lg bg-bhor-surface p-4 shadow-bhor-soft">
                <h3 className="flex items-center gap-2 text-bhor-body font-bhor-bold text-bhor-text">
                  <ShieldCheck className="h-5 w-5 text-bhor-success" aria-hidden />
                  Cancellation Policy
                </h3>
                <p className="mt-2 text-bhor-small leading-bhor-body text-bhor-text-muted">
                  Orders cannot be cancelled once packed for delivery. For pre-orders, final policy will be shown before payment confirmation.
                </p>
              </section>
            </div>

            <div className="border-t border-bhor-border bg-bhor-surface p-4">
              <Link
                href="/checkout"
                onClick={() => {
                  setCheckoutMode(hasPreOrderItems ? "scheduled" : "buy-now");
                  closeCartDrawer();
                }}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white hover:bg-bhor-primary-dark"
              >
                {hasPreOrderItems ? "Confirm Pre-Order" : "Checkout"}
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
  tone = "default",
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: "default" | "muted" | "success";
}) {
  return (
    <div
      className={`flex items-start justify-between gap-4 ${
        strong ? "text-bhor-product font-bhor-bold text-bhor-text" : "text-bhor-text-muted"
      } ${tone === "success" ? "text-bhor-success" : ""}`}
    >
      <span className="min-w-0 flex-1">{label}</span>
      <span className="shrink-0 text-right font-bhor-semibold">{value}</span>
    </div>
  );
}
