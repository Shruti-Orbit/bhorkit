"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Heart } from "lucide-react";
import type { CollectionProduct, ProductBadgeTone } from "@/src/data/products";
import { useShop } from "@/src/context/ShopContext";
import { isComingSoonProduct, isPreOrderProduct, isReadyStockProduct } from "@/src/utils/productState";
import { looksLikeEmail, subscribeToLaunch } from "@/src/lib/api/notify.api";
import { getBestEffortLocation } from "@/src/lib/geolocation";
import { ApiClientError } from "@/src/lib/api/client";

type ProductCardProps = {
  product: CollectionProduct;
  showActions?: boolean;
  actionMode?: "default" | "add-to-cart";
  compact?: boolean;
};

const badgeToneClass: Record<ProductBadgeTone, string> = {
  gold: "bg-bhor-gold-light text-bhor-primary-dark",
  success: "bg-bhor-success text-white",
  primary: "bg-bhor-primary text-white",
  soft: "bg-bhor-primary-soft text-bhor-primary",
};

export function ProductCard({
  product,
  actionMode = "default",
  compact = false,
  showActions = true,
}: ProductCardProps) {
  const { addToCart, isSavedItem, toggleSavedItem } = useShop();
  const saved = isSavedItem(product.id);
  const comingSoon = isComingSoonProduct(product);
  const preorder = isPreOrderProduct(product);
  const readyStock = isReadyStockProduct(product);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistMessage, setWaitlistMessage] = useState("");
  const [waitlistError, setWaitlistError] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  /**
   * Signs the address up with the server.
   *
   * Everything that ends up stored beyond the address — the product's name,
   * its range, where the request came from — is derived server-side from the
   * product id, so there is nothing else to send. Submitting the same address
   * twice is a success, not a failure: the server says which it was and the
   * message it returns is what is shown.
   */
  async function joinWaitlist() {
    const email = waitlistEmail.trim();

    if (!looksLikeEmail(email)) {
      setWaitlistError("Enter a valid email address");
      return;
    }

    setIsSubscribing(true);
    setWaitlistError("");

    try {
      // Best-effort, the same as the footer sign-up and the support form: if
      // the browser cannot or will not say where it is, this resolves to null
      // and the subscription is recorded without one.
      const location = await getBestEffortLocation();
      const result = await subscribeToLaunch({ email, productId: product.id, location });
      setWaitlistMessage(result.message);
    } catch (error) {
      setWaitlistError(
        error instanceof ApiClientError ? error.message : "Something went wrong. Please try again.",
      );
      setIsSubscribing(false);
    }
  }

  return (
    <article
      className={`group flex h-full w-full flex-col overflow-hidden rounded-bhor-md bg-bhor-surface shadow-bhor-soft sm:min-w-0 ${
        compact ? "min-h-[330px] md:min-h-[405px]" : "min-h-[350px] md:min-h-[445px]"
      }`}
    >
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

      <div className={`flex flex-1 flex-col px-3 md:px-4 ${compact ? "py-3" : "py-4"}`}>
        <h3
          className={`line-clamp-2 text-bhor-product-mobile font-bhor-semibold leading-bhor-heading md:text-bhor-product ${
            compact ? "min-h-[40px] md:min-h-[44px]" : "min-h-[42px] md:min-h-[52px]"
          }`}
        >
          <Link
            href={product.href}
            className="text-bhor-text transition-colors hover:text-bhor-primary"
          >
            {product.name}
          </Link>
        </h3>
        <p
          className={`mt-2 line-clamp-2 text-bhor-small leading-bhor-body text-bhor-text-muted ${
            compact ? "min-h-[34px]" : "min-h-[42px]"
          }`}
        >
          {product.description}
        </p>
        <div className={`mt-auto ${compact ? "pt-3" : "pt-4"}`}>
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
              {waitlistMessage ? (
                <p
                  role="status"
                  className="rounded-bhor-sm bg-bhor-primary-soft px-3 py-2 text-bhor-small font-bhor-semibold text-bhor-primary"
                >
                  {waitlistMessage}
                </p>
              ) : waitlistOpen ? (
                <div className="space-y-2">
                  <p className="text-bhor-caption leading-bhor-body text-bhor-text-muted">
                    We&apos;ll let you know when Navratri pre-orders open.
                  </p>
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={waitlistEmail}
                    onChange={(event) => {
                      setWaitlistEmail(event.target.value);
                      // Typing is an attempt to fix it, so the complaint goes.
                      if (waitlistError) setWaitlistError("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") void joinWaitlist();
                    }}
                    aria-label={`Email address to be notified about ${product.name}`}
                    aria-invalid={Boolean(waitlistError)}
                    placeholder="Email address"
                    className={`min-h-10 w-full rounded-bhor-sm border bg-bhor-cream px-3 text-bhor-caption text-bhor-text outline-none focus:border-bhor-primary ${
                      waitlistError ? "border-bhor-error" : "border-bhor-border"
                    }`}
                  />
                  {waitlistError ? (
                    <p role="alert" className="text-bhor-caption font-bhor-medium text-bhor-error">
                      {waitlistError}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void joinWaitlist()}
                    disabled={isSubscribing}
                    className="inline-flex min-h-10 w-full items-center justify-center rounded-bhor-sm bg-bhor-primary px-4 text-bhor-caption font-bhor-bold uppercase text-white disabled:opacity-70"
                  >
                    {isSubscribing ? "Adding..." : "Join Waitlist"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setWaitlistOpen(true)}
                  aria-label={`Notify me about ${product.name}`}
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
