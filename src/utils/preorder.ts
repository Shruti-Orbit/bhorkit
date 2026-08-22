import type { CheckoutMode } from "@/src/context/ShopContext";

// The authoritative pre-order window now lives on the server
// (SCHEDULED_MIN_DATE in src/services/delivery.service.ts), which is what
// validates the date at checkout. These constants remain for copy that names
// the date outside the checkout flow.
export const ganeshPreOrderMinDate = "2026-09-14";
export const ganeshPreOrderMinDateLabel = "September 14, 2026";

export function isValidGaneshPreOrderDate(value: string) {
  return Boolean(value) && value >= ganeshPreOrderMinDate;
}

export function isGaneshPreOrderMode(mode: CheckoutMode) {
  return mode === "scheduled";
}
