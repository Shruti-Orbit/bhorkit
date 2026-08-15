import { Hero } from "@/src/components/home/hero/Hero";
import { HomeBannerStrip } from "@/src/components/home/banner-strip/HomeBannerStrip";
import { CategoryStrip } from "@/src/components/home/category-strip/CategoryStrip";
import { PreOrderBanner } from "@/src/components/home/pre-order/PreOrderBanner";
import { ProductCollection } from "@/src/components/home/product-collection/ProductCollection";
import { RitualSeparator } from "@/src/components/home/ritual-separator/RitualSeparator";
import { navratriPromotion } from "@/src/data/promotions";
import { getHomeCatalog } from "@/src/server/catalog/productService";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { ganeshChaturthiProducts, navratriUpcomingProducts, regularPoojaKits } =
    await getHomeCatalog();

  return (
    <main className="flex flex-1 flex-col bg-bhor-cream font-sans">
      <Hero />
      <PreOrderBanner {...navratriPromotion} />
      <CategoryStrip />
      <ProductCollection
        title="Ganesh Chaturthi Collection"
        description="Everything you need to welcome Bappa."
        href="/shop/ganesh-chaturthi"
        products={ganeshChaturthiProducts}
        variant="primary"
      />
       <RitualSeparator />
      <HomeBannerStrip />


     
      <ProductCollection
        title="Regular Pooja Kits"
        description="Everyday puja essentials for your home rituals."
        href="/shop"
        products={regularPoojaKits}
        variant="regular"
      />
      <ProductCollection
        title="Coming Soon for Navratri"
        href="/pre-order"
        products={navratriUpcomingProducts}
        tone="muted"
        variant="upcoming"
      />
    </main>
  );
}
