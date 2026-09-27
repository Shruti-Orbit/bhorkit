"use client";

import { useEffect, useState } from "react";
import { AddonCard, AddonGrid } from "@/src/components/addons/AddonCard";
import { getAddons, type Addon, type AddonPlacement } from "@/src/lib/api/addon.api";

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
      className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
    >
      <div className="mb-4 sm:mb-6">
        <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-primary">
          Puja Add-ons
        </p>
        <h2
          id="complete-your-puja"
          className="mt-1 font-bhor-display text-bhor-h4-mobile font-bhor-semibold text-bhor-text md:text-bhor-h4"
        >
          Complete Your Puja
        </h2>
        <p className="mt-1 text-bhor-caption text-bhor-text-muted sm:text-bhor-small">
          Add these to your order — they arrive with your kit.
        </p>
      </div>
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
export function DontForget() {
  const addons = useAddons("checkout");
  if (addons.length === 0) return null;

  return (
    <section aria-labelledby="dont-forget" className="rounded-xl border border-bhor-border bg-bhor-surface p-4">
      <h2 id="dont-forget" className="text-bhor-small font-bhor-bold text-bhor-text">
        Don&apos;t forget
      </h2>
      <p className="mt-0.5 text-bhor-caption text-bhor-text-muted">
        Commonly added with orders like yours.
      </p>

      <ul className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3 [&::-webkit-scrollbar]:hidden">
        {addons.map((addon) => (
          <li key={addon.id} className="w-40 shrink-0 snap-start sm:w-auto">
            <AddonCard addon={addon} sizes="(min-width: 640px) 220px, 160px" />
          </li>
        ))}
      </ul>
    </section>
  );
}
