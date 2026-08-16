import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkle } from "lucide-react";
import { ProductCard } from "@/src/components/home/product-collection/ProductCard";
import { featuredFestival, festivalCollections } from "@/src/data/editorialCollections";
import { getProductsByCollection } from "@/src/server/catalog/productService";

const upcomingPanels = festivalCollections.filter((festival) => festival.status !== "available").slice(0, 2);

export const dynamic = "force-dynamic";

export default async function FestivalCollectionsPage() {
  const ganeshChaturthiProducts = await getProductsByCollection("ganesh-chaturthi");

  return (
    <main className="flex flex-1 flex-col bg-bhor-cream">
      <section id="shop-festival" className="bg-bhor-surface px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1512px]">
          <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="font-bhor-display text-bhor-h2-mobile font-bhor-semibold text-bhor-text md:text-bhor-h2">
                Ganesh Chaturthi Essentials
              </h2>
              <p className="mt-3 max-w-xl text-bhor-body leading-bhor-body text-bhor-text-muted">
                Everything you need for a complete puja, thoughtfully brought together.
              </p>
            </div>
            <Link href="/shop/ganesh-chaturthi" className="inline-flex items-center gap-2 text-bhor-button font-bhor-bold uppercase text-bhor-primary">
              View Collection
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ganeshChaturthiProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1512px]">
          <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-gold">
            Coming Up Next
          </p>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {upcomingPanels.map((festival) => (
              <Link
                key={festival.slug}
                href={festival.href}
                className="group relative min-h-[280px] overflow-hidden rounded-bhor-lg bg-bhor-primary text-white"
              >
                {festival.image ? (
                  <Image src={festival.image} alt={festival.name} fill sizes="(max-width: 767px) 100vw, 50vw" className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-[1.03]" />
                ) : (
                  <VisualPlaceholder tone={festival.visualTone} />
                )}
                <div className="absolute inset-0 bg-bhor-text/35" aria-hidden />
                <div className="relative z-10 flex h-full flex-col justify-end p-6">
                  <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-gold-light">
                    Coming Soon
                  </p>
                  <h3 className="mt-2 font-bhor-display text-bhor-h3-mobile font-bhor-semibold md:text-bhor-h3">
                    {festival.name}
                  </h3>
                  <p className="mt-2 text-bhor-small text-white/85">{festival.title}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-bhor-caption font-bhor-bold uppercase">
                    Explore
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

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

function VisualPlaceholder({ tone }: { tone: string }) {
  const label = tone === "diwali" ? "Diya" : tone === "rakhi" ? "Rakhi" : "Festive";

  return (
    <div className="absolute inset-0 bg-bhor-peach">
      <div className="absolute inset-0 bg-bhor-primary opacity-20" aria-hidden />
      <div className="absolute right-6 top-6 h-24 w-24 rounded-full border border-bhor-gold-light/70" aria-hidden />
      <div className="absolute bottom-8 left-8 text-bhor-h2 font-bhor-bold text-bhor-gold-light/80">
        {label}
      </div>
    </div>
  );
}
