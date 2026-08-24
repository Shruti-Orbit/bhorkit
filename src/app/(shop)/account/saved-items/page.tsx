"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { AccountSectionCard, AccountShell } from "@/src/components/account/AccountShell";
import { useShop } from "@/src/context/ShopContext";

export default function SavedItemsPage() {
  const { addToCart, savedItems, toggleSavedItem } = useShop();

  return (
    <AccountShell>
      <div className="space-y-5">
        <div>
          <h1 className="font-bhor-display text-bhor-h2-mobile font-bhor-semibold text-bhor-text md:text-bhor-h2">
            Saved Items
          </h1>
          <p className="mt-2 text-bhor-small text-bhor-text-muted">
            Products you&apos;ve saved for later.
          </p>
        </div>

        {savedItems.length === 0 ? (
          <AccountSectionCard>
            <div className="text-center">
              <Heart className="mx-auto h-7 w-7 text-bhor-primary" aria-hidden />
              <h2 className="mt-3 text-bhor-product font-bhor-bold text-bhor-text">
                Your saved items will appear here.
              </h2>
              <Link
                href="/shop"
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white"
              >
                Explore Products
              </Link>
            </div>
          </AccountSectionCard>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {savedItems.map((product) => (
              <article key={product.id} className="overflow-hidden rounded-bhor-lg border border-bhor-border bg-bhor-surface shadow-bhor-soft">
                <Link href={product.href} className="relative block aspect-[4/3] bg-bhor-peach">
                  <Image src={product.image} alt={product.imageAlt} fill sizes="(max-width: 767px) 100vw, 33vw" className="object-cover" />
                </Link>
                <div className="p-4">
                  <h2 className="line-clamp-2 text-bhor-product-mobile font-bhor-bold text-bhor-text">{product.name}</h2>
                  <p className="mt-2 text-bhor-product font-bhor-bold text-bhor-text">{product.price}</p>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-bhor-sm bg-bhor-primary px-3 text-bhor-button-mobile font-bhor-bold uppercase text-white"
                    >
                      <ShoppingCart className="h-4 w-4" aria-hidden />
                      Add to Cart
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${product.name}`}
                      onClick={() => toggleSavedItem(product)}
                      className="flex h-10 w-10 items-center justify-center rounded-bhor-sm border border-bhor-primary text-bhor-primary"
                    >
                      <Heart className="h-4 w-4 fill-current" aria-hidden />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AccountShell>
  );
}
