"use client";

import { useEffect, useId, useState } from "react";
import { AddonCard, AddonGrid } from "@/src/components/addons/AddonCard";
import {
  getAddons,
  type Addon,
  type AddonPlacement,
} from "@/src/lib/api/addon.api";
import { Sparkle } from "lucide-react";

/**
 * Add-ons offered inside another page.
 *
 * Fetched in the browser rather than on the server, because both hosts are
 * already-rendered pages whose own data is cached differently — a product page
 * is largely static, while which add-ons are active changes whenever an admin
 * edits one. Loading them here keeps the host page's caching alone and means a
 * failure to load add-ons can never stop a product page or a checkout from
 * rendering: the section simply does not appear.
 *
 * Which add-ons each surface may show is decided by the SERVER from the
 * placement, not chosen here — see PLACEMENT_FLOOR in the API.
 */
function useAddons(placement: AddonPlacement) {
  const [addons, setAddons] = useState<Addon[]>([]);

  useEffect(() => {
    let active = true;
    getAddons(placement)
      .then((loaded) => {
        if (active) setAddons(loaded);
      })
      // Deliberately silent. An add-on strip is an upsell; failing to load one
      // must not put an error in front of someone trying to pay.
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [placement]);

  return addons;
}

/**
 * "Complete Your Puja" — shown on a product's detail page.
 *
 * Priority and High Priority add-ons only; ordinary ones live on the Puja
 * Add-ons page.
 */
export function CompleteYourPuja() {
  const addons = useAddons("product");
  if (addons.length === 0) return null;

  return (
    <section
      aria-labelledby="complete-your-puja"
      className="mx-auto w-full px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
    >
      <header className="mb-6 sm:mb-8">
        <p className="text-bhor-caption font-bhor-bold tracking-wide text-bhor-primary">
          PUJA ADD-ONs
        </p>
        <h2 className="font-bhor-display text-bhor-h3-mobile font-bhor-semibold leading-bhor-heading text-bhor-text md:text-bhor-h3">
          Complete your puja with small extras
          <Sparkle
            className="ml-2 inline h-4 w-4 text-bhor-gold md:h-5 md:w-5"
            aria-hidden
          />
        </h2>
      </header>

      <AddonGrid addons={addons} />
    </section>
  );
}

/**
 * "Don't Forget" — shown at checkout.
 *
 * High Priority add-ons only. Somebody about to pay should see the two or three
 * things they most often wish they had ordered, not a catalogue: a long strip
 * here is a reason to leave the page.
 *
 * Laid out as a horizontal scroller on a phone and a grid from tablet up, so it
 * never pushes the payment button below the fold on a small screen.
 */
export function DontForget({
  compact = false,
  className = "",
}: {
  /** For narrow hosts such as the cart drawer: always a horizontal scroller. */
  compact?: boolean;
  className?: string;
}) {
  const addons = useAddons("checkout");
  // The cart page and the cart drawer can both be mounted at once.
  const headingId = useId();
  if (addons.length === 0) return null;

  return (
    <section
      aria-labelledby={headingId}
      className={`rounded-xl border border-bhor-border bg-bhor-surface p-4 ${className}`}
    >
      <h2
        id={headingId}
        className="text-bhor-small font-bhor-bold text-bhor-text"
      >
        Don&apos;t forget
      </h2>
      <p className="mt-0.5 text-bhor-caption text-bhor-text-muted">
        Commonly added with orders like yours.
      </p>

      {compact ? (
        <ul className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {addons.map((addon) => (
            <li key={addon.id} className="w-36 shrink-0 snap-start">
              <AddonCard addon={addon} sizes="144px" />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-5 [&::-webkit-scrollbar]:hidden">
          {addons.map((addon) => (
            <li key={addon.id} className="w-auto shrink-0 snap-start">
              <AddonCard addon={addon} sizes="(min-width: 640px) 220px, 160px" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
