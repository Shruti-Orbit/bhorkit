import { apiGet, apiPost, apiPut } from "@/src/lib/api/client";

/**
 * A coupon, as the storefront sees it: a code and a percentage.
 *
 * Never an amount. What the percentage is worth against a particular basket is
 * shown here for the customer's benefit, but the figure that gets charged is
 * recomputed by the server when the order is priced.
 */
export type AppliedCoupon = {
  code: string;
  discountPercent: number;
};

export async function applyCoupon(code: string) {
  const response = await apiPost<AppliedCoupon, { code: string }>("/orders/coupon", { code });
  return response.data;
}

// --- admin ---

export type AdminCoupon = AppliedCoupon & {
  isActive: boolean;
  updatedAt: string | null;
  updatedBy: string | null;
};

export async function getCouponForAdmin() {
  const response = await apiGet<{ coupon: AdminCoupon | null }>("/admin/coupon");
  return response.data.coupon;
}

export type CouponInput = { code: string; discountPercent: number; isActive: boolean };

export async function saveCoupon(input: CouponInput) {
  const response = await apiPut<{ coupon: AdminCoupon }, CouponInput>("/admin/coupon", input);
  return response.data.coupon;
}
