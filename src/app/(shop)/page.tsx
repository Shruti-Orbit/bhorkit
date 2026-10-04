import type { Metadata } from "next";
import { Hero } from "@/src/components/home/hero/Hero";
import { HomeBannerStrip } from "@/src/components/home/banner-strip/HomeBannerStrip";
import { CustomizeBanner } from "@/src/components/home/customize/CustomizeBanner";
import { ProductCollection } from "@/src/components/home/product-collection/ProductCollection";
import { RitualSeparator } from "@/src/components/home/ritual-separator/RitualSeparator";
import { diwaliPromotion } from "@/src/data/promotions";
import { FestivalComingSoonBanner } from "@/src/components/home/festival/FestivalComingSoonBanner";
import { getHomeCatalog, type HomeSection } from "@/src/lib/api/product.api";
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
    title: seoConfig.home.socialTitle,
    description: seoConfig.home.socialDescription,
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
    title: seoConfig.home.socialTitle,
    description: seoConfig.home.socialDescription,
    images: [seoConfig.home.ogImage.url],
  },
};

function withImageAlt(section: HomeSection, alt: (name: string) => string): HomeSection {
  return {
    ...section,
    products: section.products.map((product) => ({ ...product, imageAlt: alt(product.name) })),
  };
}

export default async function Home() {
  const { sections } = await getHomeCatalog();

  // Categories arrive in the priority order set in Admin > Categories. The
  // layout slots below stay fixed; only which category fills each one changes.
  // A category with no products yet (an upcoming festival) is left out rather
  // than shown as an empty block.
  const [first, second, ...rest] = sections.filter((section) => section.products.length > 0);
  const firstSection = first && withImageAlt(first, (name) => `${name} with puja samagri by BHORKIT`);
  const secondSection = second && withImageAlt(second, (name) => `${name} for puja essentials in Patna`);

  const homeJsonLd = createHomeJsonLd([
    ...(firstSection?.products ?? []),
    ...(secondSection?.products ?? []),
    ...rest.flatMap((section) => section.products),
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
      {firstSection ? (
        <ProductCollection
          title={firstSection.name}
          description={firstSection.description}
          href={`/shop/${firstSection.slug}`}
          products={firstSection.products}
          variant="primary"
          productActionMode="add-to-cart"
        />
      ) : null}
      <RitualSeparator />

      {secondSection ? (
        <ProductCollection
          title={secondSection.name}
          description={secondSection.description}
          href={`/shop/${secondSection.slug}`}
          products={secondSection.products}
          variant="regular"
        />
      ) : null}

      <CustomizeBanner />

      <FestivalComingSoonBanner {...diwaliPromotion} />
      {rest.map((section) => (
        <ProductCollection
          key={section.slug}
          title={section.name}
          description={section.description}
          href={`/shop/${section.slug}`}
          products={section.products}
          tone="muted"
        />
      ))}

      <HomeBannerStrip />


    </main>
  );
}
