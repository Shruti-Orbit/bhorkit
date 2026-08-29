import { apiGet, apiPatch } from "@/src/lib/api/client";

/**
 * First-order gifts, as the storefront sees them.
 *
 * A gift arrives here as a slot and a label and nothing else. What is actually
 * inside is stored on the server and served only to the admin panel, so there
 * is no field on this type that could disclose it even by accident.
 */
export type GiftOption = {
  id: string;
  slot: number;
  label: string;
};

export type CheckoutGiftState = {
  /** Whether this customer may choose a gift on the order they are placing. */
  eligible: boolean;
  /** The four cards. Empty unless eligible. */
  options: GiftOption[];
  /** Set when a gift earned earlier is travelling with this order. */
  includedGiftLabel: string | null;
};

export async function getCheckoutGiftState() {
  const response = await apiGet<CheckoutGiftState>("/orders/gift-options");
  return response.data;
}

// --- admin ---

/** Everything about a gift, including what it contains. Admin routes only. */
export type AdminGift = GiftOption & {
  internalTitle: string;
  internalDescription: string;
  isActive: boolean;
  updatedAt: string;
  updatedBy: string | null;
};

export async function listGiftsForAdmin() {
  const response = await apiGet<{ gifts: AdminGift[] }>("/admin/gifts");
  return response.data.gifts;
}

export type GiftUpdate = {
  label?: string;
  internalTitle?: string;
  internalDescription?: string;
  isActive?: boolean;
};

export async function updateGift(giftId: string, updates: GiftUpdate) {
  const response = await apiPatch<{ gift: AdminGift }, GiftUpdate>(`/admin/gifts/${giftId}`, updates);
  return response.data.gift;
}
