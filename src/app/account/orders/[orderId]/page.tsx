"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AccountSectionCard, AccountShell } from "@/src/components/account/AccountShell";
import { useShop } from "@/src/context/ShopContext";
import { formatCurrency } from "@/src/utils/discount";
import { formatDate, formatStatus, getDeliveryLabel } from "../page";

const standardSteps = ["confirmed", "processing", "packed", "out-for-delivery", "delivered"];
const preOrderSteps = ["pre-order-confirmed", "preparing", "scheduled-for-dispatch", "dispatched", "delivered"];

export default function OrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const { getOrderById } = useShop();
  const order = getOrderById(params.orderId);

  return (
    <AccountShell>
      {!order ? (
        <AccountSectionCard>
          <h1 className="text-bhor-product font-bhor-bold text-bhor-text">Order not found</h1>
          <p className="mt-2 text-bhor-small text-bhor-text-muted">
            Check your order ID and try again.
          </p>
        </AccountSectionCard>
      ) : (
        <div className="space-y-5">
          <div>
            <h1 className="font-bhor-display text-bhor-h2-mobile font-bhor-semibold text-bhor-text md:text-bhor-h2">
              Order #{order.id}
            </h1>
            <p className="mt-2 text-bhor-small text-bhor-text-muted">
              Order Date: {formatDate(order.orderDate)} · Payment Status: {formatStatus(order.paymentStatus)}
            </p>
          </div>

          <AccountSectionCard>
            <h2 className="text-bhor-product font-bhor-bold text-bhor-text">Order Tracking</h2>
            <div className="mt-5 space-y-4">
              {(order.checkoutMode === "pre-order" ? preOrderSteps : standardSteps).map((step) => {
                const activeIndex = (order.checkoutMode === "pre-order" ? preOrderSteps : standardSteps).indexOf(order.status);
                const stepIndex = (order.checkoutMode === "pre-order" ? preOrderSteps : standardSteps).indexOf(step);
                const done = stepIndex <= activeIndex;
                return (
                  <div key={step} className="flex items-center gap-3">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-bhor-caption font-bhor-bold ${done ? "bg-bhor-success text-white" : "bg-bhor-primary-soft text-bhor-primary"}`}>
                      {done ? "✓" : "○"}
                    </span>
                    <span className="text-bhor-small font-bhor-semibold text-bhor-text">{formatStatus(step)}</span>
                  </div>
                );
              })}
            </div>
          </AccountSectionCard>

          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <AccountSectionCard>
              <h2 className="text-bhor-product font-bhor-bold text-bhor-text">Items</h2>
              <div className="mt-4 divide-y divide-bhor-border">
                {order.items.map((item) => (
                  <div key={item.product.id} className="flex justify-between gap-4 py-3 text-bhor-small">
                    <div>
                      <p className="font-bhor-semibold text-bhor-text">{item.product.name}</p>
                      <p className="text-bhor-text-muted">Qty {item.quantity}</p>
                    </div>
                    <p className="font-bhor-bold text-bhor-text">{item.product.price}</p>
                  </div>
                ))}
              </div>
            </AccountSectionCard>

            <AccountSectionCard>
              <h2 className="text-bhor-product font-bhor-bold text-bhor-text">Price Breakdown</h2>
              <div className="mt-4 space-y-3 text-bhor-small">
                <Row label="Subtotal" value={formatCurrency(order.subtotal)} />
                <Row label="BHORKIT Member Discount (10% on lowest item)" value={`-${formatCurrency(order.discount)}`} />
                <Row label="Handling Charge" value={order.deliveryFee === 0 ? "Free" : formatCurrency(order.deliveryFee)} />
                <div className="border-t border-bhor-border pt-3">
                  <Row label="Total" value={formatCurrency(order.total)} strong />
                </div>
              </div>
            </AccountSectionCard>
          </div>

          <AccountSectionCard>
            <h2 className="text-bhor-product font-bhor-bold text-bhor-text">Delivery</h2>
            <p className="mt-2 text-bhor-small font-bhor-semibold text-bhor-text">{getDeliveryLabel(order)}</p>
            {order.address ? (
              <p className="mt-2 text-bhor-small leading-bhor-body text-bhor-text-muted">
                {order.address.fullName}, {order.address.house}, {order.address.area}, {order.address.city} - {order.address.pincode}
                <br />
                Mobile: {order.address.mobile}
              </p>
            ) : null}
            <Link href={`/track-order?orderId=${order.id}`} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white">
              Track Order
            </Link>
          </AccountSectionCard>
        </div>
      )}
    </AccountShell>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-x-4 gap-y-1 ${strong ? "text-bhor-product font-bhor-bold text-bhor-text" : "text-bhor-text-muted"}`}>
      <span className="min-w-0 flex-1">{label}</span>
      <span className="shrink-0 text-right">{value}</span>
    </div>
  );
}
