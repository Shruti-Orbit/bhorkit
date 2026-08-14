"use client";

import { formatCurrency } from "@/src/utils/discount";
import { useShop } from "@/src/context/ShopContext";

export function OrderSummary() {
  const { cartSubtotal, cartTotal, discountUnlocked, handlingCharge, memberDiscount } = useShop();

  return (
    <aside className="rounded-bhor-lg border border-bhor-border bg-bhor-surface p-5 shadow-bhor-soft">
      <h2 className="text-bhor-product font-bhor-bold text-bhor-text">Order Summary</h2>
      <div className="mt-4 space-y-3 text-bhor-small">
        <div className="flex justify-between gap-4 text-bhor-text-muted">
          <span>Subtotal</span>
          <span>{formatCurrency(cartSubtotal)}</span>
        </div>
        {discountUnlocked ? (
          <div className="flex justify-between gap-4 text-bhor-success">
            <span>BHORKIT Member Discount (10% on lowest item)</span>
            <span>-{formatCurrency(memberDiscount)}</span>
          </div>
        ) : (
          <p className="rounded-bhor-sm bg-bhor-primary-soft px-3 py-2 font-bhor-semibold text-bhor-primary">
            Login or create an account to unlock 10% OFF.
          </p>
        )}
        <div className="flex justify-between gap-4 text-bhor-text-muted">
          <span>Handling Charge</span>
          <span>{handlingCharge === 0 ? "Free" : formatCurrency(handlingCharge)}</span>
        </div>
        {handlingCharge > 0 ? (
          <p className="text-bhor-caption font-bhor-medium text-bhor-text-muted">
            Free handling on orders above ₹999.
          </p>
        ) : null}
        <div className="flex justify-between gap-4 border-t border-bhor-border pt-3 text-bhor-product font-bhor-bold text-bhor-text">
          <span>Total</span>
          <span>{formatCurrency(cartTotal)}</span>
        </div>
      </div>
    </aside>
  );
}
