export const memberDiscountRate = 0.1;
export const handlingCharge = 30;
export const freeHandlingThreshold = 999;

export function calculateMemberDiscount(subtotal: number) {
  return subtotal * memberDiscountRate;
}

export function calculateLowestItemMemberDiscount(
  items: { price: string; quantity: number }[],
  discountEligible: boolean,
) {
  if (!discountEligible || items.length === 0) {
    return 0;
  }

  const lowestItemPrice = items.reduce((lowest, item) => {
    const price = parsePrice(item.price);
    return price > 0 && price < lowest ? price : lowest;
  }, Number.POSITIVE_INFINITY);

  return Number.isFinite(lowestItemPrice) ? lowestItemPrice * memberDiscountRate : 0;
}

/**
 * What an applied coupon takes off, for display only.
 *
 * Mirrors the server's rounding so the summary and the amount actually charged
 * agree. The server recomputes this from catalogue prices when the order is
 * created — this figure is never sent anywhere and never decides anything.
 */
export function calculateCouponDiscount(subtotal: number, discountPercent: number) {
  if (subtotal <= 0 || discountPercent <= 0) return 0;
  return Math.round(subtotal * discountPercent) / 100;
}

export function calculateHandlingCharge(subtotal: number) {
  if (subtotal <= 0) {
    return 0;
  }

  return subtotal >= freeHandlingThreshold ? 0 : handlingCharge;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function parsePrice(price: string) {
  const parsed = Number(price.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}
