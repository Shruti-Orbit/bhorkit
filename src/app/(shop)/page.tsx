import type { Metadata } from "next";
import { Hero } from "@/src/components/home/hero/Hero";
import { HomeBannerStrip } from "@/src/components/home/banner-strip/HomeBannerStrip";
import { PreOrderBanner } from "@/src/components/home/pre-order/PreOrderBanner";
import { ProductCollection } from "@/src/components/home/product-collection/ProductCollection";
import { RitualSeparator } from "@/src/components/home/ritual-separator/RitualSeparator";
import { navratriPromotion } from "@/src/data/promotions";
import { withNavratriComingSoonPresentation } from "@/src/data/navratriComingSoon";
import { getHomeCatalog } from "@/src/lib/api/product.api";
import { absoluteUrl, createHomeJsonLd, seoConfig } from "@/src/lib/seo/config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: seoConfig.home.title,
  description: seoConfig.home.description,
  keywords: [...seoConfig.home.keywords],
  alternates: {
    canonical: seoConfig.home.path,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: seoConfig.locale,
    siteName: seoConfig.siteName,
    url: absoluteUrl(seoConfig.home.path),
    title: seoConfig.home.title,
    description: seoConfig.home.description,
    images: [
      {
        url: seoConfig.home.ogImage.url,
        width: seoConfig.home.ogImage.width,
        height: seoConfig.home.ogImage.height,
        alt: seoConfig.home.ogImage.alt,
        type: seoConfig.home.ogImage.type,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: seoConfig.home.title,
    description: seoConfig.home.description,
    images: [seoConfig.home.ogImage.url],
  },
};

export default async function Home() {
  const { ganeshChaturthiProducts, navratriUpcomingProducts, regularPoojaKits } =
    await getHomeCatalog();
  const ganeshProductsWithSeoAlt = ganeshChaturthiProducts.map((product) => ({
    ...product,
    imageAlt: `${product.name} with puja samagri by BHORKIT`,
  }));
  const regularPoojaKitsWithSeoAlt = regularPoojaKits.map((product) => ({
    ...product,
    imageAlt: `${product.name} for puja essentials in Patna`,
  }));
  const navratriProductsWithComingSoonImages =
    withNavratriComingSoonPresentation(navratriUpcomingProducts);
  const homeJsonLd = createHomeJsonLd([
    ...ganeshProductsWithSeoAlt,
    ...regularPoojaKitsWithSeoAlt,
    ...navratriProductsWithComingSoonImages,
  ]);

  return (
    <main className="flex flex-1 flex-col bg-bhor-cream font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <Hero />

      <section className="bg-bhor-cream px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1512px] rounded-bhor-sm border border-bhor-border bg-bhor-surface px-4 py-3 text-center text-bhor-small font-bhor-semibold text-bhor-primary shadow-bhor-soft">
          ✨ A New Way to Prepare for Puja — Now in Patna
        </div>
      </section>
      {/* <CategoryStrip /> */}
      <ProductCollection
        title="Ganesh Chaturthi Collection"
        description="Ganesh puja essentials and puja samagri delivered across Patna."
        href="/shop/ganesh-chaturthi"
        products={ganeshProductsWithSeoAlt}
        variant="primary"
        productActionMode="add-to-cart"
      />
      <RitualSeparator />




      <ProductCollection
        title="Regular Pooja Kits"
        description="Daily puja essentials and puja items online in Patna."
        href="/puja-kits"
        products={regularPoojaKitsWithSeoAlt}
        variant="regular"
      />

      <PreOrderBanner {...navratriPromotion} />
      <ProductCollection
        title="NAVRATRI 2026"
        description="Coming Soon"
        href="/pre-order"
        products={navratriProductsWithComingSoonImages}
        tone="muted"
        variant="upcoming"
      />

      <HomeBannerStrip />


    </main>
  );
}
