import type { ProductPurchaseState } from "@/src/data/products";

export type ShopPurchaseStateSection = {
  /** The product's `purchaseState` value. */
  state: ProductPurchaseState;
  /** Heading of the section. */
  title: string;
  /** One-liner under the heading, telling the shopper what to expect. */
  description: string;
  /** Section background, matching how the home page tones its ranges. */
  tone: "default" | "muted";
  /** Card treatment, matching the home page's collections. */
  variant: "primary" | "regular" | "upcoming";
};

/**
 * Storefront presentation for the three purchase states.
 *
 * The headings, descriptions and order are the home page's, verbatim: a
 * shopper meets these ranges on the home page first, and Shop All calling the
 * same set of kits something else made them look like different ranges. Keep
 * the two in step — if a heading changes on the home page, change it here.
 *
 * This file holds copy only. The classification lives on the product as
 * `purchaseState`, set by the API. Today each state holds exactly one range —
 * every Ganesh kit is PRE_ORDER, every regular kit READY_STOCK, every Navratri
 * kit COMING_SOON — which is what lets state-grouped sections carry range
 * headings and still read correctly. If a range ever splits across states, a
 * kit would land under another range's heading, and this copy is what needs
 * revisiting.
 *
 * See src/data/shopCategories.ts for the range copy that drives the nav and
 * the /shop/<category> pages.
 */
export const shopPurchaseStates = [
  {
    state: "PRE_ORDER",
    title: "Ganesh Chaturthi Collection",
    description: "Ganesh puja essentials and puja samagri delivered across Patna.",
    tone: "default",
    variant: "primary",
  },
  {
    state: "READY_STOCK",
    title: "Regular Pooja Kits",
    description: "Daily puja essentials and puja items online in Patna.",
    tone: "default",
    variant: "regular",
  },
  {
    state: "COMING_SOON",
    title: "NAVRATRI 2026",
    description: "Coming Soon",
    tone: "muted",
    variant: "upcoming",
  },
] as const satisfies readonly ShopPurchaseStateSection[];

/**
 * Shop All renders these sections and nothing else, so a purchase state
 * without one would drop its products off a page titled "Shop All" — silently,
 * and only for whichever kits happened to be in that state. Leaving one out is
 * therefore a type error rather than a missing block someone notices later.
 */
type UncoveredPurchaseState = Exclude<
  ProductPurchaseState,
  (typeof shopPurchaseStates)[number]["state"]
>;

const _everyPurchaseStateHasASection: UncoveredPurchaseState extends never
  ? true
  : never = true;
void _everyPurchaseStateHasASection;
