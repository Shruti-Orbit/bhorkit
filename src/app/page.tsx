import { Hero } from "@/src/components/home/hero/Hero";
import { HomeBannerStrip } from "@/src/components/home/banner-strip/HomeBannerStrip";
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
      <section className="bg-bhor-cream px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1512px] rounded-bhor-sm border border-bhor-border bg-bhor-surface px-4 py-3 text-center text-bhor-small font-bhor-semibold text-bhor-primary shadow-bhor-soft">
          ✨ A New Way to Prepare for Puja — Now in Patna
        </div>
      </section>
      {/* <CategoryStrip /> */}
      <ProductCollection
        title="Ganesh Chaturthi Collection"
        description="Everything you need to welcome Bappa."
        href="/shop/ganesh-chaturthi"
        products={ganeshChaturthiProducts}
        variant="primary"
        productActionMode="add-to-cart"
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
        title="NAVRATRI 2026"
        description="Coming Soon"
        href="/pre-order"
        products={navratriUpcomingProducts}
        tone="muted"
        variant="upcoming"
      />
    </main>
  );
}
