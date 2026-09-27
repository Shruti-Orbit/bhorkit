import type { CollectionProduct } from "@/src/data/products";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/src/lib/api/client";

export type BackendCartLineItem = {
  product: CollectionProduct;
  quantity: number;
  lineTotal: number;
};

export type BackendCart = {
  items: BackendCartLineItem[];
  /** Puja Add-ons in the cart. Empty for a cart that has none. */
  addons: BackendCartAddon[];
  /** RUPEES, across products AND add-ons — add-on paise are converted in. */
  subtotal: number;
  /** Units across products AND add-ons. */
  itemCount: number;
  removedUnavailableProductIds: string[];
  /** Add-ons dropped because they were deleted or switched off. */
  removedUnavailableAddonIds: string[];
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

/**
 * Hands the guest cart to the server at sign-in.
 *
 * Add-ons travel in their own field, by their own ids. The server turns those
 * into the internal cart references it stores, so this client never has to know
 * that namespace — and cannot forge one into the products list.
 */
export async function mergeCart(
  items: { productId: string; quantity: number }[],
  addons: { addonId: string; quantity: number }[] = [],
) {
  const response = await apiPost<
    BackendCart,
    { items: { productId: string; quantity: number }[]; addons: { addonId: string; quantity: number }[] }
  >("/cart/merge", { items, addons });
  return response.data;
}

// --- puja add-ons ---
//
// Add-ons arrive in their own array rather than inside `items`. Every existing
// reader destructures `items[].product`, and a union there would have meant a
// narrowing at each of them; an add-on is genuinely a different kind of line
// anyway — no slug, no detail page, no shop range.

export type BackendCartAddon = {
  addonId: string;
  name: string;
  description: string;
  unit: string;
  image: string | null;
  /** PAISE — unlike the product lines above, whose totals are in rupees. */
  unitPrice: number;
  quantity: number;
  /** Paise. */
  lineTotal: number;
};

export async function addCartAddon(addonId: string, quantity = 1) {
  const response = await apiPost<BackendCart, { quantity: number }>(
    `/cart/addons/${encodeURIComponent(addonId)}`,
    { quantity },
  );
  return response.data;
}

export async function setCartAddonQuantity(addonId: string, quantity: number) {
  const response = await apiPatch<BackendCart, { quantity: number }>(
    `/cart/addons/${encodeURIComponent(addonId)}`,
    { quantity },
  );
  return response.data;
}

export async function removeCartAddon(addonId: string) {
  const response = await apiDelete<BackendCart>(`/cart/addons/${encodeURIComponent(addonId)}`);
  return response.data;
}
