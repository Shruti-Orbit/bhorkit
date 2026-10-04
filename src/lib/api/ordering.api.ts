import { apiGet } from "@/src/lib/api/client";
import type { ShopCategorySlug } from "@/src/data/products";

export type RangeOrderingStatus = {
  slug: ShopCategorySlug;
  label: string;
  /** Slugs the range used to have, so a check written against an old slug still finds it. */
  previousSlugs?: string[];
  open: boolean;
  reason: "store" | "range" | null;
  message: string | null;
};

export type OrderingStatus = {
  /** The store switch. */
  acceptingOrders: boolean;
  message: string | null;
  /** Effective state per range — already false for every range when the store is closed. */
  ranges: RangeOrderingStatus[];
};

/**
 * Whether the store, and each range, is taking orders.
 *
 * For storefront chrome that is not a product: the top strip, the hero, the
 * cart and checkout. Products carry the same answer on themselves as
 * `ordering`, and the server refuses closed orders whatever the page shows.
 */
export async function getOrderingStatus(): Promise<OrderingStatus> {
  return (await apiGet<OrderingStatus>("/delivery/ordering-status")).data;
}

/**
 * Unknown (still loading, or the request failed) reads as open; the server is
 * the one that refuses. Once loaded, a range the status does not list has been
 * hidden or deleted, so it reads as closed.
 */
export function isRangeOpen(status: OrderingStatus | null, slug: ShopCategorySlug) {
  if (!status) return true;
  const range =
    status.ranges.find((candidate) => candidate.slug === slug) ??
    status.ranges.find((candidate) => candidate.previousSlugs?.includes(slug));
  return range?.open ?? false;
}
