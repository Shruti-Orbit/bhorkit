import { ProductCollection } from "@/src/components/home/product-collection/ProductCollection";
import { navratriUpcomingProducts } from "@/src/data/products";

export default function PreOrderPage() {
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
