"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AccountSectionCard, AccountShell } from "@/src/components/account/AccountShell";
import { useShop } from "@/src/context/ShopContext";
import { formatCurrency } from "@/src/utils/discount";
import { isGaneshPreOrder } from "@/src/utils/preorder";
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
        <div className="min-w-0 space-y-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="break-words font-bhor-display text-bhor-h3-mobile font-bhor-semibold leading-bhor-heading text-bhor-text md:text-bhor-h2">
                {isGaneshPreOrder(order) ? "Your BHORKIT Pre-Order is Confirmed 🪔" : `Order #${order.id}`}
              </h1>
              {isGaneshPreOrder(order) ? (
                <span className="rounded-bhor-sm bg-bhor-primary-soft px-3 py-1 text-bhor-badge font-bhor-bold uppercase text-bhor-primary">
                  Pre-Order
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-bhor-small text-bhor-text-muted">
              Order ID: {order.id} · Order Date: {formatDate(order.orderDate)} · Payment Status: {formatStatus(order.paymentStatus)}
            </p>
          </div>

          {isGaneshPreOrder(order) ? (
            <AccountSectionCard>
              <h2 className="text-bhor-product font-bhor-bold text-bhor-text">Pre-Order Summary</h2>
              <div className="mt-4 grid gap-3 text-bhor-small text-bhor-text-muted sm:grid-cols-2">
                <SummaryLine label="Product" value={order.items[0]?.product.name ?? "BHORKIT Pre-Order"} />
                <SummaryLine label="Quantity" value={String(order.items.reduce((total, item) => total + item.quantity, 0))} />
                <SummaryLine label="Selected Delivery Date" value={order.deliveryDate ? formatDate(order.deliveryDate) : "To be selected"} />
                <SummaryLine label="Delivery Location" value={order.address ? `${order.address.city} - ${order.address.pincode}` : "Patna Delivery"} />
                <SummaryLine label="Expected Delivery" value="Pre-order delivery before Ganesh Chaturthi" />
                <SummaryLine label="Order Status" value={formatStatus(order.status)} />
              </div>
              <p className="mt-4 rounded-bhor-sm bg-bhor-primary-soft px-3 py-2 text-bhor-small font-bhor-semibold text-bhor-primary">
                Pre-order confirmed 🪔 Please note: This pre-order is non-cancellable and non-refundable.
              </p>
            </AccountSectionCard>
          ) : null}

          <AccountSectionCard>
            <h2 className="text-bhor-product font-bhor-bold text-bhor-text">Order Tracking</h2>
            <div className="mt-5 space-y-4">
              {(isGaneshPreOrder(order) ? preOrderSteps : standardSteps).map((step) => {
                const steps = isGaneshPreOrder(order) ? preOrderSteps : standardSteps;
                const activeIndex = steps.indexOf(order.status);
                const stepIndex = steps.indexOf(step);
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

          <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <AccountSectionCard>
              <h2 className="text-bhor-product font-bhor-bold text-bhor-text">Items</h2>
              <div className="mt-4 divide-y divide-bhor-border">
                {order.items.map((item) => (
                  <div key={item.product.id} className="flex min-w-0 flex-wrap justify-between gap-x-4 gap-y-2 py-3 text-bhor-small">
                    <div className="min-w-0 flex-1">
                      <p className="font-bhor-semibold text-bhor-text">{item.product.name}</p>
                      <p className="text-bhor-text-muted">Qty {item.quantity}</p>
                    </div>
                    <p className="shrink-0 font-bhor-bold text-bhor-text">{item.product.price}</p>
                  </div>
                ))}
              </div>
            </AccountSectionCard>

            <AccountSectionCard>
              <h2 className="text-bhor-product font-bhor-bold text-bhor-text">Price Breakdown</h2>
              <div className="mt-4 space-y-3 text-bhor-small">
                <Row label="Subtotal" value={formatCurrency(order.subtotal)} />
                <Row label="Online Payment Discount (10%)" value={`-${formatCurrency(order.discount)}`} />
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

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">{label}</p>
      <p className="mt-1 font-bhor-semibold text-bhor-text">{value}</p>
    </div>
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
