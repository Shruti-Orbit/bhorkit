import type { ShopCategorySlug } from "@/src/data/products";

export type ShopCategory = {
  /**
   * The product's `shopCategory` value AND the URL segment under /shop.
   * Deliberately the same string: one identifier for the range means a route
   * and a filter can never disagree about which products belong to it.
   */
  slug: ShopCategorySlug;
  /** Nav label. */
  label: string;
  /** One-liner shown under the label in the desktop dropdown. */
  blurb: string;
  /** Small uppercase line above the page heading. */
  eyebrow: string;
  /** Page heading. */
  title: string;
  /** Heading of the listing block. */
  listingTitle: string;
};

/**
 * Storefront presentation for the three Shop ranges.
 *
 * This file holds copy only — labels and headings. The classification itself
 * lives on the product as `shopCategory`, defined by SHOP_CATEGORIES in the
 * API; the `slug` here is typed as ShopCategorySlug so a range that the backend
 * does not recognise cannot be added without a type error.
 *
 * One definition drives the desktop dropdown, the mobile submenu, the dynamic
 * /shop/[category] route and its static params, so a range cannot appear in the
 * nav without a page behind it, or vice versa.
 */
export const shopCategories: ShopCategory[] = [
  {
    slug: "ganesh-chaturthi",
    label: "Ganesh Chaturthi",
    blurb: "Everything you need to welcome Bappa.",
    eyebrow: "Ganesh Chaturthi",
    title: "Ganesh Chaturthi Collection",
    listingTitle: "Ganesh Chaturthi Products",
  },
  {
    slug: "navratri-upcoming",
    label: "Navratri Upcoming",
    blurb: "Nine nights of devotion, packed with care.",
    eyebrow: "Navratri Upcoming",
    title: "Navratri Upcoming Collection",
    listingTitle: "Navratri Products",
  },
  {
    slug: "regular-pooja",
    label: "Regular Pooja",
    blurb: "Everyday essentials for your home mandir.",
    eyebrow: "Regular Pooja",
    title: "Regular Pooja Collection",
    listingTitle: "Regular Pooja Products",
  },
];

export function findShopCategory(slug: string) {
  return shopCategories.find((category) => category.slug === slug);
}

/** Human label for a range, for anywhere a raw slug would be shown to a shopper. */
export function shopCategoryLabel(slug: string) {
  return findShopCategory(slug)?.label ?? slug;
}
