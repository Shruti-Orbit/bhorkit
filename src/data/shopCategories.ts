import type { CollectionProduct, ShopCategorySlug } from "@/src/data/products";
import type { PublicShopCategory } from "@/src/lib/api/category.api";

export type ShopCategory = {
  /**
   * The product's `shopCategory` value AND the URL segment under /shop.
   * Deliberately the same string: one identifier for the range means a route
   * and a filter can never disagree about which products belong to it.
   */
  slug: ShopCategorySlug;
  /** Slugs this category used to have, which still resolve to it. */
  previousSlugs: string[];
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
 * Storefront presentation for a category.
 *
 * Categories are managed in the admin panel and read from the API; this turns
 * one into the copy the nav and the /shop/<category> pages show. The same list
 * drives the desktop dropdown, the mobile submenu and the dynamic route, so a
 * category cannot appear in the nav without a page behind it, or vice versa.
 */
export function toShopCategory(category: PublicShopCategory): ShopCategory {
  return {
    slug: category.slug,
    previousSlugs: category.previousSlugs,
    label: category.name,
    blurb: category.description,
    eyebrow: category.name,
    title: `${category.name} Collection`,
    listingTitle: `${category.name} Products`,
  };
}

/** The category answering to a slug, by its current slug or one it used to have. */
export function findShopCategory(categories: readonly PublicShopCategory[], slug: string) {
  return (
    categories.find((category) => category.slug === slug) ??
    categories.find((category) => category.previousSlugs.includes(slug))
  );
}

/**
 * Whether a product belongs to the category that was known as `slug`.
 *
 * Code that targets one category by name (the Ganesh touches on the product
 * page, the pre-order links) keeps working after an admin renames that
 * category's slug, because the API lists the old slugs on each product.
 */
export function isInRange(
  product: Pick<CollectionProduct, "shopCategory" | "shopCategoryAliases">,
  slug: string,
) {
  return product.shopCategory === slug || (product.shopCategoryAliases ?? []).includes(slug);
}

/** Human label for a product's category, for anywhere a raw slug would be shown to a shopper. */
export function productCategoryLabel(product: Pick<CollectionProduct, "shopCategory" | "shopCategoryName">) {
  return product.shopCategoryName ?? product.shopCategory;
}
