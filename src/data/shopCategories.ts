import type { ProductCollectionKey } from "@/src/lib/api/product.api";

export type ShopCategory = {
  /** URL segment under /shop. */
  slug: string;
  /** Nav label. */
  label: string;
  /** One-liner shown under the label in the desktop dropdown. */
  blurb: string;
  /** Backend filter this category maps to. */
  collection: ProductCollectionKey;
  /** Small uppercase line above the page heading. */
  eyebrow: string;
  /** Page heading. */
  title: string;
  /** Heading of the listing block. */
  listingTitle: string;
};

/**
 * The three ranges behind the Shop dropdown.
 *
 * One definition drives the desktop dropdown, the mobile submenu, the dynamic
 * /shop/[category] route and its static params — so a category cannot appear in
 * the nav without a page behind it, or vice versa.
 *
 * These filter by CATALOGUE COLLECTION, not by the products' `category` field.
 * That is forced by the data: the Navratri products are all filed under
 * category "Ganesh Puja", so `?category=Ganesh Puja` returns the Ganesh and
 * Navratri ranges together and cannot tell them apart. `catalogCollection` is
 * the only field that separates the three, and it is what /shop/ganesh-chaturthi
 * already used.
 *
 * Slugs match the collection keys so the existing /shop/ganesh-chaturthi URL
 * keeps working unchanged.
 */
export const shopCategories: ShopCategory[] = [
  {
    slug: "regular-pooja",
    label: "Regular Puja",
    blurb: "Everyday essentials for your home mandir.",
    collection: "regular-pooja",
    eyebrow: "Regular Puja",
    title: "Regular Puja Collection",
    listingTitle: "Regular Puja Products",
  },
  {
    slug: "ganesh-chaturthi",
    label: "Ganesh Chaturthi",
    blurb: "Everything you need to welcome Bappa.",
    collection: "ganesh-chaturthi",
    eyebrow: "Ganesh Chaturthi",
    title: "Ganesh Chaturthi Collection",
    listingTitle: "Ganesh Chaturthi Products",
  },
  {
    slug: "navratri-upcoming",
    label: "Navratri Special",
    blurb: "Nine nights of devotion, packed with care.",
    collection: "navratri-upcoming",
    eyebrow: "Navratri Special",
    title: "Navratri Special Collection",
    listingTitle: "Navratri Products",
  },
];

export function findShopCategory(slug: string) {
  return shopCategories.find((category) => category.slug === slug);
}
