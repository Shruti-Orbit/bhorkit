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
