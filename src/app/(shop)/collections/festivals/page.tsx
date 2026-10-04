import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkle } from "lucide-react";
import { ProductCard } from "@/src/components/home/product-collection/ProductCard";
import { getHomeCatalog } from "@/src/lib/api/product.api";
import { seoConfig } from "@/src/lib/seo/config";

const pageSeo = seoConfig.pages["/collections/festivals"];

// The everyday kits have their own nav entry (Puja Kits), so they are not a festival.
const EVERYDAY_CATEGORY = "regular-pooja";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: pageSeo.title,
  description: pageSeo.description,
  keywords: [...pageSeo.keywords],
  alternates: {
    canonical: "/collections/festivals",
  },
};

export default async function FestivalCollectionsPage() {
  // Visible categories in the priority order set in Admin > Categories, so the
  // festival that is on now leads and a hidden one drops out without a deploy.
  const { sections } = await getHomeCatalog();
  const festivals = sections.filter(
    (section) => section.slug !== EVERYDAY_CATEGORY && section.products.length > 0,
  );

  return (
    <main className="flex flex-1 flex-col bg-bhor-cream">
      {festivals.map((festival, index) => (
        <section
          key={festival.slug}
          id={festival.slug}
          className={`${index % 2 === 0 ? "bg-bhor-surface" : ""} px-4 py-10 sm:px-6 lg:px-8`}
        >
          <div className="mx-auto max-w-[1512px]">
            <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="font-bhor-display text-bhor-h2-mobile font-bhor-semibold text-bhor-text md:text-bhor-h2">
                  {festival.name}
                </h2>
                {festival.description ? (
                  <p className="mt-3 max-w-xl text-bhor-body leading-bhor-body text-bhor-text-muted">
                    {festival.description}
                  </p>
                ) : null}
              </div>
              <Link href={`/shop/${festival.slug}`} className="inline-flex items-center gap-2 text-bhor-button font-bhor-bold uppercase text-bhor-primary">
                View Collection
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {festival.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <Sparkle className="mx-auto h-6 w-6 text-bhor-gold" aria-hidden />
          <h2 className="mt-4 font-bhor-display text-bhor-h2-mobile font-bhor-semibold text-bhor-text md:text-bhor-h2">
            Made for moments that matter.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-bhor-body leading-bhor-body text-bhor-text-muted">
            From the first diya to the final prayer, BHORKIT brings the essentials together with thought, care and devotion.
          </p>
          <Link href="/shop" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-bhor-sm bg-bhor-primary px-6 text-bhor-button font-bhor-bold uppercase text-white">
            Explore All Products
          </Link>
        </div>
      </section>
    </main>
  );
}
