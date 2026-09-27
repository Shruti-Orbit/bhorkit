import { apiGet } from "@/src/lib/api/client";

/**
 * Puja Add-ons, as the storefront sees them.
 *
 * A module of their own, unconnected to the inventory and to the product
 * catalogue: an add-on has no slug, no detail page and no shop range. Prices
 * arrive in PAISE, like everything in the order and payment path, and are for
 * display only — the amount charged is re-read on the server at checkout.
 */
export type AddonPriority = "normal" | "priority" | "high";

export type Addon = {
  id: string;
  name: string;
  description: string;
  /** Paise. */
  pricePaise: number;
  /** How it is sold, e.g. "piece" or "packet". */
  unit: string;
  priority: AddonPriority;
  image: string | null;
  maxQuantity: number;
};

/**
 * Which surface is asking. The server decides what each one may show — the
 * storefront cannot ask for "high priority only" and get checkout-only add-ons
 * onto a product page.
 */
export type AddonPlacement = "shop" | "product" | "checkout";

export async function getAddons(placement: AddonPlacement = "shop") {
  const response = await apiGet<Addon[]>(`/addons?placement=${placement}`, { cache: "no-store" });
  return response.data;
}
