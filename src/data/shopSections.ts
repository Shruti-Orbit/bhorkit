import type { ShopCategorySlug } from "@/src/data/products";

export type ShopSection = {
  /** The product's `shopCategory` value. */
  slug: ShopCategorySlug;
  /** Heading of the section. */
  title: string;
  /** One-liner under the heading, telling the shopper what to expect. */
  description: string;
  /** Section background, matching how the home page tones its ranges. */
  tone: "default" | "muted";
  /** Card treatment, matching the home page's collections. */
  variant: "primary" | "regular" | "upcoming";
};

/**
 * Storefront presentation for the three Shop ranges, as Shop All groups them.
 *
 * Grouped by RANGE, not by `purchaseState`. Grouping by state worked only while
 * each state happened to hold exactly one range; the moment Navratri started
 * taking pre-orders, its kits would have appeared under the Ganesh heading —
 * the risk the previous version of this file called out in its own comment.
 * The headings name ranges, so the range is what the page groups by.
 *
 * This file holds copy only. The classification lives on the product as
 * `shopCategory`, set by the API. The headings and descriptions are the home
 * page's, verbatim — keep the two in step.
 *
 * See src/data/shopCategories.ts for the range copy that drives the nav and the
 * /shop/<category> pages.
 */
export const shopSections = [
  {
    slug: "ganesh-chaturthi",
    title: "Ganesh Chaturthi Collection",
    description: "Ganesh puja essentials and puja samagri delivered across Patna.",
    tone: "default",
    variant: "primary",
  },
  {
    slug: "regular-pooja",
    title: "Regular Pooja Kits",
    description: "Daily puja essentials and puja items online in Patna.",
    tone: "default",
    variant: "regular",
  },
  {
    slug: "navratri-upcoming",
    title: "Navratri 2026",
    description: "Pre-order your Navratri puja kits for delivery across Patna.",
    tone: "muted",
    variant: "primary",
  },
] as const satisfies readonly ShopSection[];

/**
 * Shop All renders these sections and nothing else, so a range without one
 * would drop its products off a page titled "Shop All" — silently, and only for
 * whichever kits happened to be in it. Leaving one out is therefore a type
 * error rather than a missing block someone notices later.
 */
type UncoveredRange = Exclude<ShopCategorySlug, (typeof shopSections)[number]["slug"]>;

const _everyRangeHasASection: UncoveredRange extends never ? true : never = true;
void _everyRangeHasASection;
