"use client";

import type { ReactNode } from "react";
import { formatCurrency } from "@/src/utils/discount";
import { useShop } from "@/src/context/ShopContext";

export type SummaryTotals = {
  subtotal: number;
  discount: number;
  handlingCharge: number;
  total: number;
};

/** An applied coupon, for display. The amount charged is priced by the server. */
export type SummaryCoupon = {
  code: string;
  discountPercent: number;
  discount: number;
};

type OrderSummaryProps = {
  /**
   * Totals to display instead of the cart's. Used by direct (Buy Now)
   * checkout, whose item never enters the cart. Both sets of numbers are
   * display-only — the server re-prices the order from the catalogue either
   * way, so these can never determine what's charged.
   */
  totals?: SummaryTotals;
  /** Shown as its own line when the customer has applied a coupon. */
  coupon?: SummaryCoupon | null;
  /**
   * The Apply Coupon control, rendered between the breakdown and the total.
   *
   * Passed in rather than built here so this component stays a summary: the
   * cart page shows the same totals without any way to enter a code, and gets
   * no control at all.
   */
  couponControl?: ReactNode;
};

export function OrderSummary({ totals, coupon, couponControl }: OrderSummaryProps = {}) {
  const { cartSubtotal, cartTotal, handlingCharge, memberDiscount } = useShop();

  const subtotal = totals?.subtotal ?? cartSubtotal;
  const discount = totals?.discount ?? memberDiscount;
  const handling = totals?.handlingCharge ?? handlingCharge;
  const baseTotal = totals?.total ?? cartTotal;
  const couponDiscount = coupon?.discount ?? 0;
  // Never below zero: a coupon large enough to cover the goods still leaves the
  // handling charge, and the server clamps the same way when it prices.
  const total = Math.max(0, baseTotal - couponDiscount);

  return (
    <aside className="rounded-bhor-lg border border-bhor-border bg-bhor-surface p-5 shadow-bhor-soft">
      <h2 className="text-bhor-product font-bhor-bold text-bhor-text">Order Summary</h2>
      <div className="mt-4 space-y-3 text-bhor-small">
        <div className="flex justify-between gap-4 text-bhor-text-muted">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between gap-4 text-bhor-success">
          <span>Online Payment Discount (10%)</span>
          <span>-{formatCurrency(discount)}</span>
        </div>
        {coupon ? (
          <div className="flex justify-between gap-4 text-bhor-success">
            <span>
              Coupon {coupon.code} ({coupon.discountPercent}%)
            </span>
            <span>-{formatCurrency(couponDiscount)}</span>
          </div>
        ) : null}
        <div className="flex justify-between gap-4 text-bhor-text-muted">
          <span>Handling Charge</span>
          <span>{handling === 0 ? "Free" : formatCurrency(handling)}</span>
        </div>
        {handling > 0 ? (
          <p className="text-bhor-caption font-bhor-medium text-bhor-text-muted">
            Free handling on orders above ₹999.
          </p>
        ) : null}
        {couponControl ? (
          <div className="border-t border-bhor-border pt-3">{couponControl}</div>
        ) : null}
        <div className="flex justify-between gap-4 border-t border-bhor-border pt-3 text-bhor-product font-bhor-bold text-bhor-text">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </aside>
  );
}
