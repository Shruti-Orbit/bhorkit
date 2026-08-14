"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { OrderSummary } from "@/src/components/cart/OrderSummary";
import { useShop } from "@/src/context/ShopContext";
import { formatCurrency, parsePrice } from "@/src/utils/discount";

export default function CartPage() {
  const { cartItems, removeFromCart, updateCartItem } = useShop();

  return (
    <main className="flex flex-1 flex-col bg-bhor-cream px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-[1512px] gap-8 lg:grid-cols-[1fr_360px]">
        <section>
          <h1 className="font-bhor-display text-bhor-h2-mobile font-bhor-semibold text-bhor-text md:text-bhor-h2">
            Your Cart
          </h1>
          {cartItems.length === 0 ? (
            <div className="mt-6 rounded-bhor-lg border border-bhor-border bg-bhor-surface p-8 text-center">
              <p className="text-bhor-body font-bhor-semibold text-bhor-text">Your cart is empty.</p>
              <Link
                href="/"
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {cartItems.map((item) => (
                <article
                  key={item.product.id}
                  className="grid gap-4 rounded-bhor-lg border border-bhor-border bg-bhor-surface p-4 shadow-bhor-soft sm:grid-cols-[140px_1fr]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-bhor-md bg-bhor-peach">
                    <Image src={item.product.image} alt={item.product.imageAlt} fill sizes="140px" className="object-cover" />
                  </div>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-bhor-product font-bhor-semibold text-bhor-text">{item.product.name}</h2>
                      <p className="mt-1 text-bhor-small font-bhor-bold text-bhor-text">
                        {formatCurrency(parsePrice(item.product.price))}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => updateCartItem(item.product.id, item.quantity - 1)}
                        className="flex h-10 w-10 items-center justify-center rounded-bhor-sm border border-bhor-border text-bhor-text"
                      >
                        <Minus className="h-4 w-4" aria-hidden />
                      </button>
                      <span className="min-w-6 text-center text-bhor-small font-bhor-bold text-bhor-text">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => updateCartItem(item.product.id, item.quantity + 1)}
                        className="flex h-10 w-10 items-center justify-center rounded-bhor-sm border border-bhor-border text-bhor-text"
                      >
                        <Plus className="h-4 w-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        aria-label="Remove item"
                        onClick={() => removeFromCart(item.product.id)}
                        className="flex h-10 w-10 items-center justify-center rounded-bhor-sm text-bhor-primary"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="space-y-4">
          <OrderSummary />
          {cartItems.length > 0 ? (
            <Link
              href="/checkout"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white hover:bg-bhor-primary-dark"
            >
              Checkout
            </Link>
          ) : null}
        </div>
      </div>
    </main>
  );
}
