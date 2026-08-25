import { ShopListing } from "@/src/components/shop/ShopListing";
import { getProductsByCollection } from "@/src/lib/api/product.api";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const ganeshChaturthiProducts = await getProductsByCollection("ganesh-chaturthi");

  return (
    <ShopListing
      eyebrow="Shop All"
      title="BHORKIT Puja Essentials"
      listingHref="/shop"
      listingTitle="Ganesh Chaturthi Products"
      products={ganeshChaturthiProducts}
    />
  );
}
