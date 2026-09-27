"use client";

import Image from "next/image";
import { PackageOpen, Trash2 } from "lucide-react";
import { useShop } from "@/src/context/ShopContext";
import { formatPaise } from "@/src/utils/money";
import { QuantityStepper } from "@/src/components/customize/QuantityStepper";

/**
 * Puja Add-ons in the cart.
 *
 * Its own block, under the kits, because an add-on is a different kind of line:
 * no product page to link to, sold by a unit rather than as a kit, and unable to
 * be ordered on its own. Grouping them also makes the "add a kit" rule below
 * read as a fact about the cart rather than an error attached to one row.
 */
export function CartAddonList({ compact = false }: { compact?: boolean }) {
  const { cartAddons, updateCartAddon, removeAddonFromCart, cartNeedsProduct } = useShop();

  if (cartAddons.length === 0) return null;

  return (
    <section aria-labelledby="cart-addons" className={compact ? "" : "mt-6"}>
      <h2
        id="cart-addons"
        className={`font-bhor-bold text-bhor-text ${compact ? "text-bhor-caption uppercase tracking-wide" : "text-bhor-product"}`}
      >
        Puja Add-ons
      </h2>

      {/* The server refuses an add-ons-only checkout. Saying so here, where the
          customer can act on it, beats letting them reach the payment step and
          be turned away. */}
      {cartNeedsProduct ? (
        <p
          role="status"
          className="mt-2 rounded-bhor-sm border border-bhor-border bg-bhor-peach px-3 py-2 text-bhor-caption font-bhor-semibold leading-bhor-body text-bhor-error"
        >
          Add-ons are delivered with a puja kit. Add a kit to your cart to check out.
        </p>
      ) : null}

      <ul className={`space-y-3 ${compact ? "mt-2" : "mt-4"}`}>
        {cartAddons.map((line) => (
          <li
            key={line.addon.id}
            className={`flex items-center gap-3 rounded-bhor-md border border-bhor-border bg-bhor-surface ${compact ? "p-2" : "p-3"}`}
          >
            <div
              className={`relative shrink-0 overflow-hidden rounded-bhor-sm bg-bhor-peach ${compact ? "h-12 w-12" : "h-16 w-16"}`}
            >
              {line.addon.image ? (
                <Image
                  src={line.addon.image}
                  alt={line.addon.name}
                  fill
                  sizes={compact ? "48px" : "64px"}
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full items-center justify-center text-bhor-gold/70">
                  <PackageOpen className="h-5 w-5" strokeWidth={1.4} aria-hidden />
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-bhor-small font-bhor-semibold capitalize text-bhor-text">
                {line.addon.name}
              </p>
              <p className="text-bhor-caption text-bhor-text-muted">
                {formatPaise(line.addon.pricePaise)} / {line.addon.unit}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden text-bhor-small font-bhor-bold tabular-nums text-bhor-text sm:inline">
                {formatPaise(line.addon.pricePaise * line.quantity)}
              </span>
              <QuantityStepper
                compact
                name={line.addon.name}
                quantity={line.quantity}
                max={line.addon.maxQuantity}
                onChange={(next) => updateCartAddon(line.addon.id, next)}
              />
              {compact ? null : (
                <button
                  type="button"
                  onClick={() => removeAddonFromCart(line.addon.id)}
                  aria-label={`Remove ${line.addon.name}`}
                  className="rounded-bhor-sm p-2 text-bhor-error"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
