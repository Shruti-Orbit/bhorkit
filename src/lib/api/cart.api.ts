import type { CollectionProduct } from "@/src/data/products";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/src/lib/api/client";

export type BackendCartLineItem = {
  product: CollectionProduct;
  quantity: number;
  lineTotal: number;
};

export type BackendCart = {
  items: BackendCartLineItem[];
  subtotal: number;
  itemCount: number;
  removedUnavailableProductIds: string[];
};

export async function getCart() {
  const response = await apiGet<BackendCart>("/cart");
  return response.data;
}

export async function addCartItem(productId: string, quantity = 1) {
  const response = await apiPost<BackendCart, { quantity: number }>(`/cart/${encodeURIComponent(productId)}`, { quantity });
  return response.data;
}

export async function setCartItemQuantity(productId: string, quantity: number) {
  const response = await apiPatch<BackendCart, { quantity: number }>(`/cart/${encodeURIComponent(productId)}`, { quantity });
  return response.data;
}

export async function removeCartItem(productId: string) {
  const response = await apiDelete<BackendCart>(`/cart/${encodeURIComponent(productId)}`);
  return response.data;
}

export async function clearCart() {
  await apiDelete<{ cleared: boolean }>("/cart");
}

export async function mergeCart(items: { productId: string; quantity: number }[]) {
  const response = await apiPost<BackendCart, { items: { productId: string; quantity: number }[] }>("/cart/merge", { items });
  return response.data;
}
