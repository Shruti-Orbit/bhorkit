import { formatCurrency } from "@/src/utils/discount";

// Order and payment amounts arrive from the API in paise (integers), the same
// unit Razorpay uses. Catalogue prices are still rupee strings like "₹699" —
// these helpers are only for the order/payment path.

export function paiseToRupees(paise: number) {
  return paise / 100;
}

export function formatPaise(paise: number) {
  return formatCurrency(paiseToRupees(paise));
}
