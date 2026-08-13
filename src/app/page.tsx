import { Hero } from "@/src/components/home/hero/Hero";
import { PreOrderBanner } from "@/src/components/home/pre-order/PreOrderBanner";
import { ProductCollection } from "@/src/components/home/product-collection/ProductCollection";
import { RitualSeparator } from "@/src/components/home/ritual-separator/RitualSeparator";
import { ganeshChaturthiProducts, navratriUpcomingProducts } from "@/src/data/products";
import { navratriPromotion } from "@/src/data/promotions";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col bg-bhor-cream font-sans">
      <Hero />
      <PreOrderBanner {...navratriPromotion} />
      <ProductCollection
        title="Ganesh Chaturthi Collection"
        href="/shop/ganesh-chaturthi"
        products={ganeshChaturthiProducts}
      />
      <RitualSeparator />
      <ProductCollection
        title="Upcoming Navratri Products"
        href="/pre-order"
        products={navratriUpcomingProducts}
      />
    </main>
  );
}
