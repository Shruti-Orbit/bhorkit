import type { CollectionProduct } from "@/src/data/products";
import { apiDelete, apiGet, apiPut } from "@/src/lib/api/client";

export async function getWishlist() {
  const response = await apiGet<CollectionProduct[]>("/wishlist");
  return response.data;
}

export async function addToWishlist(productId: string) {
  await apiPut<{ productId: string; saved: boolean }>(`/wishlist/${encodeURIComponent(productId)}`);
}

export async function removeFromWishlist(productId: string) {
  await apiDelete<{ productId: string; saved: boolean }>(`/wishlist/${encodeURIComponent(productId)}`);
}
