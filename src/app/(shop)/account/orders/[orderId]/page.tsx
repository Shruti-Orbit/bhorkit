"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Download, Loader2 } from "lucide-react";
import { AccountSectionCard, AccountShell } from "@/src/components/account/AccountShell";
import { useShop } from "@/src/context/ShopContext";
import { getInvoiceUrl, getOrder, type BackendOrder } from "@/src/lib/api/order.api";
import { formatPaise } from "@/src/utils/money";
import {
  deliveryLabel,
  formatOrderDate,
  formatOrderStatus,
  fulfilmentSteps,
  isOrderCancelled,
  isOrderPaid,
  isPreOrder,
  paymentMethodLabel,
} from "@/src/utils/order";

export default function OrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const { getOrderById } = useShop();
  const orderId = params.orderId;

  // Seed from the already-loaded list so a click from My Orders paints
  // instantly, then confirm against the server — the list can be stale, and a
  // deep link or refresh has nothing cached at all.
  const cached = getOrderById(orderId);
  const [order, setOrder] = useState<BackendOrder | null>(cached ?? null);
  const [isLoading, setIsLoading] = useState(!cached);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;

    getOrder(orderId)
      .then((fetched) => {
        if (!active) return;
        setOrder(fetched);
      })
      .catch(() => {
        if (!active) return;
        setNotFound(true);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [orderId]);

  if (isLoading && !order) {
    return (
      <AccountShell>
        <AccountSectionCard>
          <p className="flex items-center justify-center gap-2 text-bhor-small text-bhor-text-muted">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Loading your order…
          </p>
        </AccountSectionCard>
      </AccountShell>
    );
  }

  if (!order || notFound) {
    return (
      <AccountShell>
        <AccountSectionCard>
          <h1 className="text-bhor-product font-bhor-bold text-bhor-text">Order not found</h1>
          <p className="mt-2 text-bhor-small text-bhor-text-muted">
            Check your order ID and try again.
          </p>
        </AccountSectionCard>
      </AccountShell>
    );
  }

  const cancelled = isOrderCancelled(order);
  const paid = isOrderPaid(order);
  const activeStepIndex = fulfilmentSteps.indexOf(order.status);

  return (
    <AccountShell>
      <div className="min-w-0 space-y-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="break-words font-bhor-display text-bhor-h3-mobile font-bhor-semibold leading-bhor-heading text-bhor-text md:text-bhor-h2">
              Order #{order.orderNumber}
            </h1>
            {isPreOrder(order) ? (
              <span className="rounded-bhor-sm bg-bhor-primary-soft px-3 py-1 text-bhor-badge font-bhor-bold uppercase text-bhor-primary">
                Pre-Order
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-bhor-small text-bhor-text-muted">
            Order Date: {formatOrderDate(order.createdAt)} · Payment:{" "}
            <span className={cancelled ? "text-bhor-error" : "text-bhor-success"}>
              {paid ? `Paid · ${paymentMethodLabel(order.payment.method)}` : formatOrderStatus(order.status)}
            </span>
          </p>
        </div>

        {cancelled ? (
          <AccountSectionCard>
            <h2 className="text-bhor-product font-bhor-bold text-bhor-error">
              {formatOrderStatus(order.status)}
            </h2>
            <p className="mt-2 text-bhor-small leading-bhor-body text-bhor-text-muted">
              {order.payment.failureReason ?? "This order was not completed."} If any amount was
              debited, it will be returned to your account automatically within 5–7 working days.
            </p>
            <Link
              href="/cart"
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white"
            >
              Back to Cart
            </Link>
          </AccountSectionCard>
        ) : (
          <AccountSectionCard>
            <h2 className="text-bhor-product font-bhor-bold text-bhor-text">Order Tracking</h2>
            <div className="mt-5 space-y-4">
              {fulfilmentSteps.map((step, index) => {
                const done = activeStepIndex >= index;
                return (
                  <div key={step} className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-bhor-caption font-bhor-bold ${
                        done ? "bg-bhor-success text-white" : "bg-bhor-primary-soft text-bhor-primary"
                      }`}
                    >
                      {done ? "✓" : "○"}
                    </span>
                    <span className="text-bhor-small font-bhor-semibold text-bhor-text">
                      {formatOrderStatus(step)}
                    </span>
                  </div>
                );
              })}
            </div>
          </AccountSectionCard>
        )}

        <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <AccountSectionCard>
            <h2 className="text-bhor-product font-bhor-bold text-bhor-text">Items</h2>
            <div className="mt-4 divide-y divide-bhor-border">
              {order.items.map((item) => (
                <div
                  key={item.productId}
                  className="flex min-w-0 flex-wrap justify-between gap-x-4 gap-y-2 py-3 text-bhor-small"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bhor-semibold text-bhor-text">{item.name}</p>
                    <p className="text-bhor-text-muted">
                      Qty {item.quantity} × {formatPaise(item.unitPrice)}
                    </p>
                  </div>
                  <p className="shrink-0 font-bhor-bold text-bhor-text">{formatPaise(item.lineTotal)}</p>
                </div>
              ))}
            </div>
          </AccountSectionCard>

          <AccountSectionCard>
            <h2 className="text-bhor-product font-bhor-bold text-bhor-text">Price Breakdown</h2>
            <div className="mt-4 space-y-3 text-bhor-small">
              <Row label="Subtotal" value={formatPaise(order.pricing.subtotal)} />
              <Row
                label="Online Payment Discount (10%)"
                value={`-${formatPaise(order.pricing.discount)}`}
              />
              <Row
                label="Handling Charge"
                value={
                  order.pricing.handlingCharge === 0 ? "Free" : formatPaise(order.pricing.handlingCharge)
                }
              />
              <div className="border-t border-bhor-border pt-3">
                <Row label={paid ? "Total Paid" : "Total"} value={formatPaise(order.pricing.total)} strong />
              </div>
            </div>
            {paid ? (
              <a
                href={getInvoiceUrl(order.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-bhor-sm border border-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-bhor-primary"
              >
                <Download className="h-4 w-4" aria-hidden />
                Download Invoice
              </a>
            ) : null}
          </AccountSectionCard>
        </div>

        <AccountSectionCard>
          <h2 className="text-bhor-product font-bhor-bold text-bhor-text">Delivery</h2>
          <p className="mt-2 text-bhor-small font-bhor-semibold text-bhor-text">{deliveryLabel(order)}</p>
          <p className="mt-2 text-bhor-small leading-bhor-body text-bhor-text-muted">
            {order.address.fullName}, {order.address.house}, {order.address.area},{" "}
            {order.address.city} - {order.address.pincode}
            <br />
            Mobile: {order.address.mobile}
          </p>
          {!cancelled ? (
            <Link
              href={`/track-order?orderId=${order.orderNumber}`}
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white"
            >
              Track Order
            </Link>
          ) : null}
        </AccountSectionCard>
      </div>
    </AccountShell>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div
      className={`flex flex-wrap items-start justify-between gap-x-4 gap-y-1 ${
        strong ? "text-bhor-product font-bhor-bold text-bhor-text" : "text-bhor-text-muted"
      }`}
    >
      <span className="min-w-0 flex-1">{label}</span>
      <span className="shrink-0 text-right">{value}</span>
    </div>
  );
}
