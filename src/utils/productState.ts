import type { CollectionProduct } from "@/src/data/products";

export function isPreOrderProduct(product: CollectionProduct) {
  return product.purchaseState === "PRE_ORDER";
}

export function isComingSoonProduct(product: CollectionProduct) {
  return product.purchaseState === "COMING_SOON";
}

export function isReadyStockProduct(product: CollectionProduct) {
  return product.purchaseState === "READY_STOCK";
}

/**
 * A product an admin has deactivated. It stays visible on the storefront but
 * cannot be bought: every buy button checks this, and the server refuses it at
 * the cart and at checkout independently.
 *
 * Checked BEFORE purchaseState everywhere. A deactivated product keeps its
 * original purchase state (pre-order, ready stock, coming soon), so without
 * this taking precedence it would still render that state's buy button.
 */
export function isOutOfStockProduct(product: Pick<CollectionProduct, "availability">) {
  return product.availability === "unavailable";
}
