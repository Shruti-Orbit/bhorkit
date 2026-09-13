import Link from "next/link";
import { ArrowRight, PackageCheck } from "lucide-react";
import type { CollectionProduct } from "@/src/data/products";
import { shopCategoryLabel } from "@/src/data/shopCategories";
import { purchaseBlock } from "@/src/utils/productState";

type FinalProductCtaProps = {
  product: CollectionProduct;
};

export function FinalProductCta({ product }: FinalProductCtaProps) {
  const block = purchaseBlock(product);
  const ganesh = product.shopCategory === "ganesh-chaturthi";
  const rangeLabel = shopCategoryLabel(product.shopCategory);
  const storeClosed = product.ordering?.reason === "store";

  // What the closing banner says depends on why the kit cannot be bought. When
  // only this kit is out of stock, the rest of its range is a real alternative;
  // when the whole range has closed, the rest of the shop is; and when the
  // store itself is closed there is nowhere useful to send anyone.
  const body = !block
    ? ganesh
      ? `Reserve ${product.name} and keep your celebration simple, beautiful and thoughtfully prepared.`
      : `Order ${product.name} and keep your puja simple, beautiful and thoughtfully prepared.`
    : block.kind === "out-of-stock"
      ? `${product.name} is out of stock right now. Explore our other ${rangeLabel} kits.`
      : storeClosed
        ? block.message
        : `${block.message} Explore our other kits.`;

  const href = block?.kind === "orders-closed" ? "/shop" : `/shop/${product.shopCategory}`;

  return (
    <section className="bg-bhor-cream px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1512px] overflow-hidden rounded-bhor-lg border border-bhor-border bg-bhor-surface shadow-bhor-soft md:grid-cols-[58%_42%]">
        <div className="p-6 md:p-9">
          <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-gold">
            {ganesh ? "Ready for Ganesh Chaturthi" : rangeLabel}
          </p>
          <h2 className="mt-2 font-bhor-display text-bhor-h2-mobile font-bhor-semibold leading-bhor-heading text-bhor-text md:text-bhor-h2">
            {ganesh ? "Bring Bappa Home With Love." : "Devotion, Delivered to Your Door."}
          </h2>
          <p className="mt-3 max-w-2xl text-bhor-body-mobile leading-bhor-body text-bhor-text-muted md:text-bhor-body">
            {body}
          </p>
          {storeClosed ? null : (
            <Link
              href={href}
              className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-bhor-sm bg-bhor-primary px-6 text-bhor-button font-bhor-bold uppercase text-white transition-colors hover:bg-bhor-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
            >
              {block ? "Explore Other Kits" : "Order Now"}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
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
