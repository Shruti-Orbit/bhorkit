"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Heart } from "lucide-react";
import type { CollectionProduct, ProductBadgeTone } from "@/src/data/products";
import { useShop } from "@/src/context/ShopContext";
import { isComingSoonProduct, isPreOrderProduct, isReadyStockProduct } from "@/src/utils/productState";

type ProductCardProps = {
  product: CollectionProduct;
  showActions?: boolean;
  actionMode?: "default" | "add-to-cart";
};

const badgeToneClass: Record<ProductBadgeTone, string> = {
  gold: "bg-bhor-gold-light text-bhor-primary-dark",
  success: "bg-bhor-success text-white",
  primary: "bg-bhor-primary text-white",
  soft: "bg-bhor-primary-soft text-bhor-primary",
};

export function ProductCard({ product, actionMode = "default", showActions = true }: ProductCardProps) {
  const { addToCart, isSavedItem, toggleSavedItem } = useShop();
  const saved = isSavedItem(product.id);
  const comingSoon = isComingSoonProduct(product);
  const preorder = isPreOrderProduct(product);
  const readyStock = isReadyStockProduct(product);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistContact, setWaitlistContact] = useState("");
  const [waitlistSaved, setWaitlistSaved] = useState(false);

  function saveWaitlist() {
    const contact = waitlistContact.trim();

    if (!contact) {
      return;
    }

    const key = "bhorkit_waitlist_requests";
    const existing = window.localStorage.getItem(key);
    const requests = existing ? safelyParseWaitlist(existing) : [];
    window.localStorage.setItem(
      key,
      JSON.stringify([
        ...requests,
        {
          productId: product.id,
          productName: product.name,
          contact,
          createdAt: new Date().toISOString(),
        },
      ]),
    );
    setWaitlistSaved(true);
  }

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
          <p className="mt-2 text-bhor-product font-bhor-bold text-bhor-text">{product.price}</p>

          {showActions && comingSoon ? (
            <div className="mt-3">
              {waitlistSaved ? (
                <p className="rounded-bhor-sm bg-bhor-primary-soft px-3 py-2 text-bhor-small font-bhor-semibold text-bhor-primary">
                  You&apos;re on the list ✨
                </p>
              ) : waitlistOpen ? (
                <div className="space-y-2">
                  <p className="text-bhor-caption leading-bhor-body text-bhor-text-muted">
                    We&apos;ll let you know when Navratri pre-orders open.
                  </p>
                  <input
                    value={waitlistContact}
                    onChange={(event) => setWaitlistContact(event.target.value)}
                    placeholder="Email or mobile number"
                    className="min-h-10 w-full rounded-bhor-sm border border-bhor-border bg-bhor-cream px-3 text-bhor-caption text-bhor-text outline-none focus:border-bhor-primary"
                  />
                  <button
                    type="button"
                    onClick={saveWaitlist}
                    className="inline-flex min-h-10 w-full items-center justify-center rounded-bhor-sm bg-bhor-primary px-4 text-bhor-caption font-bhor-bold uppercase text-white"
                  >
                    Join Waitlist
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setWaitlistOpen(true)}
                  className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-bhor-sm bg-bhor-primary px-4 text-bhor-caption font-bhor-bold uppercase text-white hover:bg-bhor-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
                >
                  Notify Me
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              )}
            </div>
          ) : showActions && preorder && actionMode === "add-to-cart" ? (
            <button
              type="button"
              onClick={() => addToCart(product)}
              className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-bhor-sm bg-bhor-primary px-4 text-bhor-caption font-bhor-bold uppercase text-white hover:bg-bhor-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
            >
              Add To Cart
            </button>
          ) : showActions && preorder ? (
            <Link
              href={product.href}
              className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-bhor-sm bg-bhor-primary px-4 text-bhor-caption font-bhor-bold uppercase text-white hover:bg-bhor-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
            >
              Pre-Order
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : showActions && readyStock ? (
            // In-stock products previously fell through to `null` — a card with
            // a price and no way to buy. Every listing rendered so far happened
            // to hold pre-order or coming-soon items, so the gap stayed hidden
            // until the Regular Pooja Kits, the only ready-stock range, got a
            // page of their own.
            <button
              type="button"
              onClick={() => addToCart(product)}
              className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-bhor-sm bg-bhor-primary px-4 text-bhor-caption font-bhor-bold uppercase text-white hover:bg-bhor-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
            >
              Add To Cart
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function safelyParseWaitlist(value: string): unknown[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
