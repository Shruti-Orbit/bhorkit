import { apiGet, apiPost } from "@/src/lib/api/client";

/**
 * Customize Order, as the storefront sees it.
 *
 * Deliberately price-free: the server says what each item is, the pack a
 * customer receives and whether it is in stock — and prices only a whole box.
 */
export type CustomizationItem = {
  /** The inventory id of the item. */
  id: string;
  name: string;
  /** What one pack holds, e.g. "5 g" or "1 kg". */
  pack: string;
  inStock: boolean;
};

export type CustomizationCatalog = {
  /** Whether custom orders are being accepted at all. */
  enabled: boolean;
  /** The fewest different items a box may hold. */
  minItems: number;
  maxQuantityPerItem: number;
  /** The most different items a box may hold. */
  maxItems: number;
  items: CustomizationItem[];
};

export type CustomBoxSelectionLine = { ingredientId: string; quantity: number };

export type CustomBoxQuote = {
  enabled: boolean;
  /** Paise. The total of the items that can be sold. */
  totalPaise: number;
  /** Different items that can be sold. */
  itemCount: number;
  packCount: number;
  minItems: number;
  meetsMinimum: boolean;
  /** Items in the box that can no longer be picked — removed, paused or out of stock. */
  unavailableIds: string[];
};

export async function getCustomizationCatalog() {
  const response = await apiGet<CustomizationCatalog>("/customization", { cache: "no-store" });
  return response.data;
}

export async function quoteCustomBox(items: CustomBoxSelectionLine[]) {
  const response = await apiPost<CustomBoxQuote, { items: CustomBoxSelectionLine[] }>("/customization/quote", {
    items,
  });
  return response.data;
}
