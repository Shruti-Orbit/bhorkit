"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { CollectionProduct, ProductBadgeTone } from "@/src/data/products";
import { useShop } from "@/src/context/ShopContext";

type ProductCardProps = {
  product: CollectionProduct;
};

const badgeToneClass: Record<ProductBadgeTone, string> = {
  gold: "bg-bhor-gold-light text-bhor-primary-dark",
  success: "bg-bhor-success text-white",
  primary: "bg-bhor-primary text-white",
  soft: "bg-bhor-primary-soft text-bhor-primary",
};

export function ProductCard({ product }: ProductCardProps) {
  const { isSavedItem, toggleSavedItem } = useShop();
  const saved = isSavedItem(product.id);

  return (
    <article className="group flex h-full min-h-[350px] w-full flex-col overflow-hidden rounded-bhor-md bg-bhor-surface shadow-bhor-soft sm:min-w-0 md:min-h-[445px]">
      <Link
        href={product.href}
        className="relative block aspect-[4/3] overflow-hidden bg-bhor-peach focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-bhor-primary"
      >
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          sizes="(max-width: 767px) 92vw, (max-width: 1279px) 25vw, 340px"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <button
          type="button"
          aria-label={`Save ${product.name}`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleSavedItem(product);
          }}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-bhor-surface/90 shadow-bhor-soft transition-opacity md:opacity-0 md:group-hover:opacity-100 ${
            saved ? "text-bhor-primary" : "text-bhor-text"
          }`}
        >
          <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} aria-hidden />
        </button>
      </Link>

      <div className="flex flex-1 flex-col px-3 py-4 md:px-4">
        <Link
          href={product.href}
          className="line-clamp-2 min-h-[42px] text-bhor-product-mobile font-bhor-semibold leading-bhor-heading text-bhor-text transition-colors hover:text-bhor-primary md:min-h-[52px] md:text-bhor-product"
        >
          {product.name}
        </Link>
        <p className="mt-2 line-clamp-2 min-h-[42px] text-bhor-small leading-bhor-body text-bhor-text-muted">
          {product.description}
        </p>
        <div className="mt-auto pt-4">
          {product.badge ? (
            <span
              className={`inline-flex w-fit rounded-bhor-sm px-2.5 py-1 text-bhor-badge font-bhor-bold uppercase tracking-wide ${badgeToneClass[product.badge.tone]}`}
            >
              {product.badge.label}
            </span>
          ) : null}
          <p className="text-bhor-product font-bhor-bold text-bhor-text">{product.price}</p>
        </div>
      </div>
    </article>
  );
}
