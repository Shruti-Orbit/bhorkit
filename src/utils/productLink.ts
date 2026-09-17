import type { CollectionProduct } from "@/src/data/products";

/**
 * Where a product card points.
 *
 * `href` is stored on the product, and a range that launched as "coming soon"
 * can still carry a landing page there — the Navratri kits pointed at
 * /pre-order, so their cards opened a listing instead of the kit. Every product
 * has a detail page and that is what a card must open, so anything that is not
 * a product URL falls back to the product's own page.
 */
export function productHref(product: Pick<CollectionProduct, "href" | "slug">) {
  return product.href?.startsWith("/products/") ? product.href : `/products/${product.slug}`;
}
