"use client";

import Image from "next/image";
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

/**
 * One line of the order, as the summary draws it.
 *
 * Deliberately a flat display shape rather than a product: the summary should
 * not have to know how a cart item differs from a Buy Now item, and callers
 * already know which of the two they are holding.
 */
export type SummaryItem = {
  id: string;
  name: string;
  image: string;
  imageAlt: string;
  quantity: number;
  /** Price of one, for the "2 × ₹699" line. */
  unitPrice: number;
  /** What this line costs in total — quantity included. */
  lineTotal: number;
  /** e.g. "Pre-order". Omitted when there is nothing worth saying. */
  badge?: string;
};

type OrderSummaryProps = {
  /**
   * The products being bought, listed above the totals.
   *
   * Optional because the cart page shows the same items in its own table
   * directly beside this — repeating them there would be noise. Checkout is
   * where they matter, because nothing else on that page says what is in the
   * order.
   */
  items?: SummaryItem[];
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

export function OrderSummary({ items, totals, coupon, couponControl }: OrderSummaryProps = {}) {
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
      <h2 className="text-bhor-product font-bhor-bold text-bhor-text">
        Order Summary
        {items && items.length > 0 ? (
          <span className="ml-2 text-bhor-small font-bhor-medium text-bhor-text-muted">
            ({items.length} {items.length === 1 ? "item" : "items"})
          </span>
        ) : null}
      </h2>

      {items && items.length > 0 ? (
        <ul className="mt-4 space-y-3 border-b border-bhor-border pb-4">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-bhor-sm bg-bhor-peach">
                <Image
                  src={item.image}
                  alt={item.imageAlt}
                  fill
                  sizes="56px"
                  className="object-cover object-center"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-bhor-small font-bhor-semibold leading-bhor-body text-bhor-text">
                  {item.name}
                </p>
                <p className="mt-0.5 text-bhor-caption text-bhor-text-muted">
                  Qty {item.quantity}
                  {/* Only worth showing when it is not the same as the line
                      total — for a single item the two are identical. */}
                  {item.quantity > 1 ? ` × ${formatCurrency(item.unitPrice)}` : null}
                </p>
                {item.badge ? (
                  <span className="mt-1 inline-flex rounded-bhor-sm bg-bhor-primary-soft px-2 py-0.5 text-bhor-badge font-bhor-bold uppercase tracking-wide text-bhor-primary">
                    {item.badge}
                  </span>
                ) : null}
              </div>

              <p className="shrink-0 text-bhor-small font-bhor-semibold text-bhor-text">
                {formatCurrency(item.lineTotal)}
              </p>
            </li>
          ))}
        </ul>
      ) : null}

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
