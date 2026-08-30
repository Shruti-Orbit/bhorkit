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

/**
 * The promotional bar, as the storefront sees it.
 *
 * Only what the bar draws — no settings, no timestamps beyond the two the
 * countdown needs. `serverTime` is the moment the API answered, used to
 * correct for a browser clock that is wrong.
 */
export type Announcement = {
  message: string;
  code: string;
  discountPercent: number;
  buttonLabel: string;
  endsAt: string;
  serverTime: string;
  background: string;
  textColor: string;
  accentColor: string;
  buttonBackground: string;
  buttonTextColor: string;
};

export async function getAnnouncement() {
  const response = await apiGet<{ announcement: Announcement | null }>("/orders/announcement");
  return response.data.announcement;
}

// --- admin ---

/** The bar's configuration, as the admin screen edits it. */
export type AnnouncementSettings = {
  enabled: boolean;
  message: string;
  buttonLabel: string;
  /** ISO instants, or empty when unset. */
  startsAt: string;
  endsAt: string;
  background: string;
  textColor: string;
  accentColor: string;
  buttonBackground: string;
  buttonTextColor: string;
};

export type AdminCoupon = AppliedCoupon & {
  isActive: boolean;
  announcement: AnnouncementSettings;
  updatedAt: string | null;
  updatedBy: string | null;
};

export async function getCouponForAdmin() {
  const response = await apiGet<{ coupon: AdminCoupon | null }>("/admin/coupon");
  return response.data.coupon;
}

export type CouponInput = {
  code: string;
  discountPercent: number;
  isActive: boolean;
  announcement?: Partial<AnnouncementSettings>;
};

export async function saveCoupon(input: CouponInput) {
  const response = await apiPut<{ coupon: AdminCoupon }, CouponInput>("/admin/coupon", input);
  return response.data.coupon;
}
