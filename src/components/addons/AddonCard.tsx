"use client";

import Image from "next/image";
import { PackageOpen } from "lucide-react";
import { useShop } from "@/src/context/ShopContext";
import type { Addon } from "@/src/lib/api/addon.api";
import { formatPaise } from "@/src/utils/money";
import { QuantityStepper } from "@/src/components/customize/QuantityStepper";

/**
 * One Puja Add-on, as a shelf card.
 *
 * Deliberately NOT a link. Add-ons have no detail page — there is no slug, no
 * gallery and no description page to route to — so the card is inert apart from
 * its Add control. Making the tile clickable would promise a page that does not
 * exist.
 */

function AddonPhoto({ src, alt, sizes }: { src: string | null; alt: string; sizes: string }) {
  return (
    <span className="relative block aspect-square w-full overflow-hidden bg-[#F6EEE3]">
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-bhor-gold/70">
          <PackageOpen className="h-1/3 w-1/3" strokeWidth={1.4} aria-hidden />
        </span>
      )}
    </span>
  );
}

export function AddonCard({ addon, sizes }: { addon: Addon; sizes: string }) {
  const { addAddonToCart, updateCartAddon, addonQuantity } = useShop();
  const quantity = addonQuantity(addon.id);
  const inCart = quantity > 0;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-[#ECE3D8] bg-white transition-shadow duration-200 hover:shadow-[0_8px_24px_-12px_rgb(36_26_28/0.25)]">
      <AddonPhoto src={addon.image} alt={addon.name} sizes={sizes} />

      <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5">
        <h3 className="line-clamp-2 text-bhor-small font-bhor-semibold capitalize leading-snug text-bhor-text">
          {addon.name}
        </h3>
        {addon.description ? (
          <p className="mt-1 line-clamp-2 text-bhor-caption leading-snug text-bhor-text-muted">
            {addon.description}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
          <span className="text-bhor-small font-bhor-bold tabular-nums text-bhor-text">
            {formatPaise(addon.pricePaise)}
            <span className="ml-1 text-bhor-caption font-bhor-regular text-bhor-text-muted">/ {addon.unit}</span>
          </span>

          {inCart ? (
            <QuantityStepper
              compact
              name={addon.name}
              quantity={quantity}
              max={addon.maxQuantity}
              onChange={(next) => updateCartAddon(addon.id, next)}
            />
          ) : (
            <button
              type="button"
              onClick={() => addAddonToCart(addon, 1)}
              className="inline-flex h-8 min-w-[72px] items-center justify-center rounded-lg border border-bhor-primary bg-bhor-primary-soft/40 px-4 text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-primary transition-colors hover:bg-bhor-primary hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
            >
              Add <span className="sr-only">{addon.name} to your cart</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/**
 * A row of add-ons, used by every surface that offers them.
 *
 * One component so "Complete Your Puja" on a product page and the Puja Add-ons
 * listing cannot drift apart in how an add-on looks or behaves. The grid is
 * responsive by column count rather than by breakpoint-specific markup, so the
 * same cards reflow from two across on a phone to five on a wide desktop.
 */
export function AddonGrid({ addons }: { addons: Addon[] }) {
  if (addons.length === 0) return null;

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {addons.map((addon) => (
        <li key={addon.id} className="h-full">
          <AddonCard
            addon={addon}
            sizes="(min-width: 1280px) 220px, (min-width: 1024px) 24vw, (min-width: 640px) 30vw, 45vw"
          />
        </li>
      ))}
    </ul>
  );
}
