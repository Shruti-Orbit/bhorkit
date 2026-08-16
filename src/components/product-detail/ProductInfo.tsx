import { PackageCheck } from "lucide-react";
import type { CollectionProduct } from "@/src/data/products";
import { AboutProductAccordion } from "./AboutProductAccordion";
import { ProductPurchasePanel } from "./ProductPurchasePanel";

type ProductInfoProps = {
  product: CollectionProduct;
};

const trustPoints = ["Curated with Devotion", "Secure Packaging", "Patna Delivery", "Secure Checkout"];

export function ProductInfo({ product }: ProductInfoProps) {
  return (
    <div className="flex flex-col gap-5 md:pb-4">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="w-fit rounded-bhor-sm bg-bhor-primary-soft px-3 py-1 text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-primary">
            Ganesh Chaturthi · Pre-Order
          </p>
          {product.badge ? (
            <p className="text-bhor-small font-bhor-bold text-bhor-gold">{product.badge.label}</p>
          ) : null}
        </div>

        <h1 className="mt-4 font-bhor-display text-bhor-h1-mobile font-bhor-bold leading-bhor-tight text-bhor-text md:text-bhor-h3">
          {product.name}
        </h1>
        <p className="mt-3 text-bhor-body leading-bhor-body text-bhor-text-muted">{product.subtitle}</p>
        <p className="mt-3 text-bhor-small font-bhor-semibold text-bhor-success">
          Reserve your kit in advance and receive it before Ganesh Chaturthi.
        </p>
      </div>

      <div>
        <p className="text-bhor-h3 font-bhor-bold text-bhor-text">{product.price}</p>
        <p className="mt-1 text-bhor-small text-bhor-text-muted">Inclusive of all taxes</p>
      </div>

      <ProductPurchasePanel product={product} />

      <div className="rounded-bhor-md border border-bhor-border bg-bhor-surface p-4">
        <div className="grid grid-cols-2 gap-3 text-bhor-caption font-bhor-semibold text-bhor-text sm:grid-cols-4">
          {trustPoints.map((label) => (
            <div key={label} className="flex items-center gap-2">
              <PackageCheck className="h-4 w-4 text-bhor-gold" aria-hidden />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <AboutProductAccordion product={product} />
    </div>
  );
}
