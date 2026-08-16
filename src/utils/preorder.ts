import type { CheckoutMode, CustomerOrder } from "@/src/context/ShopContext";

export const ganeshPreOrderMinDate = "2026-09-14";
export const ganeshPreOrderMinDateLabel = "September 14, 2026";

export function isValidGaneshPreOrderDate(value: string) {
  return Boolean(value) && value >= ganeshPreOrderMinDate;
}

export function isGaneshPreOrderMode(mode: CheckoutMode) {
  return mode === "scheduled";
}

export function isGaneshPreOrder(order: CustomerOrder) {
  return order.checkoutMode === "scheduled" || order.checkoutMode === "pre-order";
}
