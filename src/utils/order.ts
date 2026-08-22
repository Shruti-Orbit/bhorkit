import type { BackendOrder, OrderStatus } from "@/src/lib/api/order.api";

// Presentation helpers shared by the order list, order detail, tracking and
// success pages, so a status only has to be spelled one way.

const statusLabels: Record<OrderStatus, string> = {
  awaiting_payment: "Awaiting Payment",
  confirmed: "Confirmed",
  processing: "Processing",
  packed: "Packed",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  payment_failed: "Payment Failed",
};

/** The happy-path progression a customer is shown as a tracker. */
export const fulfilmentSteps: OrderStatus[] = [
  "confirmed",
  "processing",
  "packed",
  "out_for_delivery",
  "delivered",
];

export function formatOrderStatus(status: OrderStatus) {
  return statusLabels[status] ?? status;
}

export function isOrderCancelled(order: BackendOrder) {
  return order.status === "cancelled" || order.status === "payment_failed";
}

export function isOrderPaid(order: BackendOrder) {
  return order.payment.status === "paid";
}

export function isPreOrder(order: BackendOrder) {
  return order.delivery.mode === "scheduled";
}

export function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

/** Delivery dates are plain YYYY-MM-DD; parse as UTC so the day never shifts. */
export function formatDeliveryDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00.000Z`));
}

export function deliveryLabel(order: BackendOrder) {
  return `${formatDeliveryDate(order.delivery.date)} · ${order.delivery.slotLabel}`;
}

export function paymentMethodLabel(method: string | null) {
  if (!method) return "Online";
  const labels: Record<string, string> = {
    upi: "UPI",
    card: "Card",
    netbanking: "Net Banking",
    wallet: "Wallet",
    emi: "EMI",
  };
  return labels[method] ?? method.toUpperCase();
}
