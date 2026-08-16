"use client";

import Link from "next/link";
import { AccountSectionCard, AccountShell } from "@/src/components/account/AccountShell";
import { useShop, type CustomerOrder } from "@/src/context/ShopContext";
import { formatCurrency } from "@/src/utils/discount";
import { isGaneshPreOrder } from "@/src/utils/preorder";

export default function AccountOrdersPage() {
  const { orders } = useShop();

  return (
    <AccountShell>
      <div className="space-y-5">
        <div>
          <h1 className="font-bhor-display text-bhor-h2-mobile font-bhor-semibold text-bhor-text md:text-bhor-h2">
            My Orders
          </h1>
          <p className="mt-2 text-bhor-small text-bhor-text-muted">
            View your BHORKIT purchases and pre-orders.
          </p>
        </div>

        {orders.length === 0 ? (
          <AccountSectionCard>
            <div className="text-center">
              <h2 className="text-bhor-product font-bhor-bold text-bhor-text">No orders yet</h2>
              <p className="mt-2 text-bhor-small text-bhor-text-muted">
                Your next devotional purchase will appear here.
              </p>
              <Link
                href="/shop"
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white"
              >
                Start Shopping
              </Link>
            </div>
          </AccountSectionCard>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <AccountSectionCard key={order.id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-bhor-product font-bhor-bold text-bhor-text">
                        ORDER #{order.id}
                      </h2>
                      {isGaneshPreOrder(order) ? (
                        <span className="rounded-bhor-sm bg-bhor-primary-soft px-2 py-1 text-bhor-badge font-bhor-bold uppercase text-bhor-primary">
                          Pre-Order
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-bhor-small text-bhor-text-muted">
                      Placed on: {formatDate(order.orderDate)}
                    </p>
                    <p className="mt-1 text-bhor-small text-bhor-text-muted">
                      Status: <span className="font-bhor-semibold text-bhor-success">{formatStatus(order.status)}</span>
                    </p>
                    <p className="mt-1 text-bhor-small text-bhor-text-muted">
                      Delivery: {getDeliveryLabel(order)}
                    </p>
                    <div className="mt-3 space-y-1">
                      {order.items.map((item) => (
                        <p key={item.product.id} className="text-bhor-small text-bhor-text">
                          {item.product.name} <span className="text-bhor-text-muted">Qty {item.quantity}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="min-w-[180px]">
                    <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">
                      Total
                    </p>
                    <p className="mt-1 text-bhor-product font-bhor-bold text-bhor-text">
                      {formatCurrency(order.total)}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link href={`/account/orders/${order.id}`} className="rounded-bhor-sm bg-bhor-primary px-4 py-2 text-bhor-button-mobile font-bhor-bold uppercase text-white">
                        View Order
                      </Link>
                      <Link href={`/track-order?orderId=${order.id}`} className="rounded-bhor-sm border border-bhor-primary px-4 py-2 text-bhor-button-mobile font-bhor-bold uppercase text-bhor-primary">
                        Track Order
                      </Link>
                    </div>
                  </div>
                </div>
              </AccountSectionCard>
            ))}
          </div>
        )}
      </div>
    </AccountShell>
  );
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export function formatStatus(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getDeliveryLabel(order: CustomerOrder) {
  if (order.checkoutMode === "pre-order") {
    return `Expected Dispatch: ${order.expectedDispatch ?? "To be confirmed"}`;
  }
  if (order.checkoutMode === "scheduled") {
    return `Pre-Order Delivery: ${order.deliveryDate ?? "Date pending"} ${order.deliverySlot ?? ""}`;
  }
  return order.expectedDelivery ?? "Earliest Available Delivery";
}
