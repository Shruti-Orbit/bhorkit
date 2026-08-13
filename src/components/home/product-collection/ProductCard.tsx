import Image from "next/image";
import Link from "next/link";
import type {
  CollectionProduct,
  ProductBadgeTone,
} from "@/src/data/products";

type ProductCardProps = {
  product: CollectionProduct;
};

const badgeToneClass: Record<ProductBadgeTone, string> = {
  gold: "border-bhor-gold bg-bhor-gold-light text-bhor-primary-dark",
  success: "border-bhor-success bg-bhor-success text-white",
  primary: "border-bhor-primary bg-bhor-primary text-white",
  soft: "border-bhor-primary bg-bhor-primary-soft text-bhor-primary",
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group flex h-full min-h-[360px] w-full flex-col overflow-hidden rounded-bhor-md border border-bhor-border bg-bhor-surface shadow-bhor-soft sm:min-w-0 md:min-h-[470px]">
      <Link
        href={product.href}
        className="relative block aspect-[4/3] overflow-hidden bg-bhor-peach focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-bhor-primary"
      >
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          sizes="(max-width: 767px) 92vw, (max-width: 1279px) 25vw, 300px"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </Link>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-4">
        <Link
          href={product.href}
          className="line-clamp-2 min-h-[42px] text-bhor-product-mobile font-bhor-semibold leading-bhor-heading text-bhor-text transition-colors hover:text-bhor-primary md:min-h-[52px] md:text-bhor-product"
        >
          {product.name}
        </Link>
        <p className="mt-2 hidden min-h-[46px] text-bhor-small leading-bhor-body text-bhor-text-muted sm:block">
          {product.description}
        </p>
        <div className="mt-auto">
        {product.badge ? (
          <span
            className={`mt-3 inline-flex w-fit rounded-bhor-sm border px-2.5 py-1 text-bhor-badge font-bhor-bold uppercase tracking-wide ${badgeToneClass[product.badge.tone]}`}
          >
            {product.badge.label}
          </span>
        ) : null}
        {product.price ? (
          <p className="mt-2 text-bhor-product font-bhor-bold text-bhor-text">{product.price}</p>
        ) : (
          <p className="mt-2 text-bhor-product-mobile font-bhor-bold text-bhor-primary">
            Coming Soon
          </p>
        )}
        </div>
      </div>
    </article>
  );
}
