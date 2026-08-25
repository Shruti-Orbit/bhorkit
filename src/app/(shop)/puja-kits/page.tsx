import type { Metadata } from "next";
import { ShopListing } from "@/src/components/shop/ShopListing";
import { catalogCategories } from "@/src/data/categories";
import { getProductsByCategory } from "@/src/lib/api/product.api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Regular Pooja Kits | BHORKIT",
  description: "Everyday puja essentials for your home rituals.",
};

/**
 * The Puja Kits nav entry.
 *
 * Filtered by catalogue category rather than by collection: the
 * "regular-pooja" collection also carries products filed under other
 * categories, and this page must show the Regular Puja kits only.
 */
export default async function RegularPoojaKitsPage() {
  const products = await getProductsByCategory(catalogCategories.regularPuja);

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
