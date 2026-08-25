import { ShopListing } from "@/src/components/shop/ShopListing";
import { getProductsByCollection } from "@/src/lib/api/product.api";

export const dynamic = "force-dynamic";

export default async function GaneshChaturthiShopPage() {
  const ganeshChaturthiProducts = await getProductsByCollection("ganesh-chaturthi");

  return (
    <ShopListing
      eyebrow="Ganesh Chaturthi"
      title="Ganesh Chaturthi Collection"
      listingHref="/shop/ganesh-chaturthi"
      listingTitle="Ganesh Chaturthi Products"
      products={ganeshChaturthiProducts}
    />
  );
}
