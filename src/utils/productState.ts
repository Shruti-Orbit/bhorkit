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

/**
 * The admin has stopped taking orders for this product's range, or for the
 * whole store. The API decides; the product arrives with the answer on it.
 */
export function isOrderingClosed(product: Pick<CollectionProduct, "ordering">) {
  return product.ordering?.open === false;
}

export type PurchaseBlock = {
  kind: "out-of-stock" | "orders-closed";
  label: string;
  message: string;
};

/**
 * Why this product cannot be bought right now, or null when it can.
 *
 * The single thing every buy button asks. Out of stock wins over orders
 * closed: it is specific to this product and stays true after ordering
 * reopens. Coming Soon is not a block — Notify Me is not an order — so cards
 * that show it handle that state before asking this.
 */
export function purchaseBlock(product: Pick<CollectionProduct, "availability" | "ordering">): PurchaseBlock | null {
  if (isOutOfStockProduct(product)) {
    return {
      kind: "out-of-stock",
      label: "Out of Stock",
      message: "This kit isn't available to order right now. Please check back soon.",
    };
  }
  if (isOrderingClosed(product)) {
    return {
      kind: "orders-closed",
      label: "Orders Closed",
      message: product.ordering?.message ?? "Orders are closed right now.",
    };
  }
  return null;
}
