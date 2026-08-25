import { ShopListing } from "@/src/components/shop/ShopListing";
import { getAllProducts } from "@/src/lib/api/product.api";

export const dynamic = "force-dynamic";

/**
 * Shop All — the whole catalogue.
 *
 * The header's Shop entry now opens a category dropdown instead of navigating
 * here, so this page is reached directly or from the footer. It used to fetch
 * only the Ganesh Chaturthi collection while titled "Shop All", which is the
 * behaviour the dropdown replaced; showing every product makes the page match
 * its own heading, and each individual range has its own /shop/<category> URL.
 */
export default async function ShopPage() {
  const products = await getAllProducts();

  return (
    <ShopListing
      eyebrow="Shop All"
      title="BHORKIT Puja Essentials"
      listingHref="/shop"
      listingTitle="All Products"
      products={products}
    />
  );
}
