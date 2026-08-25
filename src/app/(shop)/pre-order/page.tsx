import { ProductCollection } from "@/src/components/home/product-collection/ProductCollection";
import { getProductsByShopCategory } from "@/src/lib/api/product.api";

export const dynamic = "force-dynamic";

export default async function PreOrderPage() {
  const navratriUpcomingProducts = await getProductsByShopCategory("navratri-upcoming");

  return (
    <main className="flex flex-1 flex-col bg-bhor-cream">
      <ProductCollection
        title="Upcoming Navratri Products"
        href="/pre-order"
        products={navratriUpcomingProducts}
      />
    </main>
  );
}
