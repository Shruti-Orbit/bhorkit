import Link from "next/link";
import { ArrowRight, Sparkle } from "lucide-react";
import type { CollectionProduct } from "@/src/data/products";
import { ProductCard } from "./ProductCard";

type ProductCollectionProps = {
  title: string;
  href: string;
  products: CollectionProduct[];
  tone?: "default" | "muted";
};

export function ProductCollection({
  title,
  href,
  products,
  tone = "default",
}: ProductCollectionProps) {
  return (
    <section className={`${tone === "muted" ? "bg-bhor-surface" : "bg-bhor-cream"} px-4 py-6 sm:px-6 lg:px-8`}>
      <div className="mx-auto max-w-[1512px]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-bhor-display text-bhor-h3-mobile font-bhor-semibold leading-bhor-heading text-bhor-text md:text-bhor-h3">
            {title}
            <Sparkle className="ml-2 inline h-4 w-4 text-bhor-gold md:h-5 md:w-5" aria-hidden />
          </h2>
          <Link
            href={href}
            className="inline-flex shrink-0 items-center gap-2 text-bhor-button-mobile font-bhor-bold text-bhor-primary transition-colors hover:text-bhor-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary md:text-bhor-button"
          >
            View All
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 lg:gap-7">
          {products.map((product) => (
            <div key={product.id} className="w-full basis-full shrink-0 snap-start sm:w-auto sm:basis-auto">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
