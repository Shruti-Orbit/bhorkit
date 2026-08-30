import Link from "next/link";
import { ArrowRight, PackageCheck } from "lucide-react";
import type { CollectionProduct } from "@/src/data/products";

type FinalProductCtaProps = {
  product: CollectionProduct;
};

export function FinalProductCta({ product }: FinalProductCtaProps) {
  return (
    <section className="bg-bhor-cream px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1512px] overflow-hidden rounded-bhor-lg border border-bhor-border bg-bhor-surface shadow-bhor-soft md:grid-cols-[58%_42%]">
        <div className="p-6 md:p-9">
          <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-gold">
            Ready for Ganesh Chaturthi
          </p>
          <h2 className="mt-2 font-bhor-display text-bhor-h2-mobile font-bhor-semibold leading-bhor-heading text-bhor-text md:text-bhor-h2">
            Bring Bappa Home With Love.
          </h2>
          <p className="mt-3 max-w-2xl text-bhor-body-mobile leading-bhor-body text-bhor-text-muted md:text-bhor-body">
            Reserve {product.name} and keep your celebration simple, beautiful and thoughtfully prepared.
          </p>
          <Link
            href="/shop/ganesh-chaturthi"
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-bhor-sm bg-bhor-primary px-6 text-bhor-button font-bhor-bold uppercase text-white transition-colors hover:bg-bhor-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
          >
            Pre-Order Ganesh Kit
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="grid gap-3 border-t border-bhor-border bg-bhor-primary-soft p-6 md:border-l md:border-t-0 md:p-9">
          {["Curated puja essentials", "Secure packaging", "Patna doorstep delivery"].map((point) => (
            <div key={point} className="flex items-center gap-3 rounded-bhor-md bg-bhor-surface p-4">
              <PackageCheck className="h-5 w-5 text-bhor-gold" aria-hidden />
              <p className="text-bhor-small font-bhor-semibold text-bhor-text">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
