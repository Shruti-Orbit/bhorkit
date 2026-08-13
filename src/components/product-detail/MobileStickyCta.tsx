import Link from "next/link";
import type { CollectionProduct } from "@/src/data/products";

type MobileStickyCtaProps = {
  product: CollectionProduct;
};

export function MobileStickyCta({ product }: MobileStickyCtaProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-bhor-border bg-bhor-surface px-4 py-3 shadow-bhor-soft md:hidden">
      <div className="mx-auto flex max-w-md items-center gap-3">
        <p className="text-bhor-product font-bhor-bold text-bhor-text">{product.price}</p>
        <Link
          href="/checkout"
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-bhor-sm bg-bhor-primary px-4 text-bhor-button-mobile font-bhor-bold uppercase text-white"
        >
          Order Now
        </Link>
      </div>
    </div>
  );
}
