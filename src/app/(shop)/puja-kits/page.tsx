import type { Metadata } from "next";
import { ShopListing } from "@/src/components/shop/ShopListing";
import { getProductsByShopCategory } from "@/src/lib/api/product.api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Regular Pooja Kits | BHORKIT",
  description: "Everyday puja essentials for your home rituals.",
};

/**
 * The Puja Kits nav entry — the everyday kits under their own heading, kept
 * separate from the Shop dropdown.
 *
 * Filtered on the product's own `shopCategory`, the same field and value the
 * Shop's Regular Pooja range uses. It previously filtered a free-text category
 * ("Regular Puja") that no longer exists: two fields describing one range is
 * precisely what let Ganesh and Navratri products get mixed together, so this
 * page reads the single source of truth like every other listing. Ganesh and
 * Navratri products therefore cannot appear here.
 */
export default async function RegularPoojaKitsPage() {
  const products = await getProductsByShopCategory("regular-pooja");

  return (
    <ShopListing
      eyebrow="Puja Kits"
      title="Regular Pooja Kits"
      listingHref="/puja-kits"
      listingTitle="Everyday Puja Essentials"
      products={products}
    />
  );
}
