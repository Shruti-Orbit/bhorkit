"use client";

import Link from "next/link";
import { ArrowRight, Flame, MapPin, ShoppingCart } from "lucide-react";
import type { CollectionProduct } from "@/src/data/products";
import { useShop } from "@/src/context/ShopContext";
import { purchaseBlock } from "@/src/utils/productState";

type ProductPurchasePanelProps = {
  product: CollectionProduct;
};

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const { addToCart, buyNow } = useShop();
  const block = purchaseBlock(product);
  // The festival wording is only true of the Ganesh Chaturthi range. It used to
  // appear on every product page, Regular Pooja included, which would have kept
  // advertising Ganesh orders on exactly the pages that stay open when that
  // range closes.
  const ganesh = product.shopCategory === "ganesh-chaturthi";

  return (
    <section className="rounded-bhor-md border border-bhor-border bg-bhor-surface p-4">
      <p className="flex items-center gap-2 text-bhor-small font-bhor-semibold text-bhor-text">
        <MapPin className="h-4 w-4 text-bhor-primary" aria-hidden />
        Patna Delivery
      </p>
      <p className="mt-2 text-bhor-small leading-bhor-body text-bhor-text-muted">
        {ganesh ? "Order delivery before Ganesh Chaturthi." : "Delivered to your doorstep across Patna."}
      </p>

      {/* Promotional copy belongs with the buy buttons: beside an Out of Stock
          or Orders Closed notice it would contradict it. */}
      {block ? (
        <div role="status" className="mt-5 rounded-bhor-md border border-bhor-border bg-bhor-cream p-4">
          <p className="text-bhor-button font-bhor-bold uppercase text-bhor-error">{block.label}</p>
          <p className="mt-1 text-bhor-small leading-bhor-body text-bhor-text-muted">{block.message}</p>
        </div>
      ) : (
        <>
          {ganesh ? (
            <div className="mt-5 rounded-bhor-sm bg-bhor-primary-soft p-3">
              <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-primary">
                Ganesh Chaturthi · Order Now
              </p>
              <p className="mt-1 text-bhor-small font-bhor-semibold text-bhor-text">
                Reserve your kit in advance and receive it before Ganesh Chaturthi.
              </p>
            </div>
          ) : null}

          <Link
            href="/checkout"
            onClick={() => buyNow(product, "scheduled")}
            className={`${ganesh ? "mt-3" : "mt-5"} block rounded-bhor-md border border-bhor-primary bg-bhor-primary p-4 text-white transition-colors hover:bg-bhor-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary`}
          >
            <span className="flex items-center justify-between gap-3">
              <span className="text-bhor-button font-bhor-bold uppercase">Order Now</span>
              <ArrowRight className="h-4 w-4" aria-hidden />
            </span>
            <span className="mt-2 flex items-center gap-2 text-bhor-small font-bhor-semibold text-white/85">
              <Flame className="h-4 w-4 text-bhor-gold-light" aria-hidden />
              {ganesh ? "Reserve your kit for Ganesh Chaturthi" : "Delivered to your doorstep in Patna"}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => addToCart(product)}
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-bhor-sm border border-bhor-border bg-bhor-surface px-5 text-bhor-button font-bhor-semibold text-bhor-text hover:border-bhor-primary hover:text-bhor-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
          >
            <ShoppingCart className="h-4 w-4" aria-hidden />
            Add to Cart
          </button>
        </>
      )}
    </section>
  );
}
