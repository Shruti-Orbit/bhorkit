import type { Metadata } from "next";
import { AddonGrid } from "@/src/components/addons/AddonCard";
import { getAddons } from "@/src/lib/api/addon.api";

export const dynamic = "force-dynamic";

/**
 * Puja Add-ons.
 *
 * A STATIC segment under /shop, which Next matches ahead of the dynamic
 * /shop/[category] route. That is what lets "Puja Add-ons" sit in the Shop menu
 * beside the three ranges without being one: it has no shopCategory, so a
 * product can never be filed into it, and [category] never sees this slug.
 *
 * Nothing here links anywhere. Add-ons have no detail page, so each card is a
 * price and an Add control rather than a link to a page that does not exist.
 */
export const metadata: Metadata = {
  title: "Puja Add-ons | BHORKIT",
  description:
    "Small extras to complete your puja — flowers, diyas, samagri and more, added to any BHORKIT order.",
  alternates: { canonical: "/shop/puja-addons" },
};

export default async function PujaAddonsPage() {
  const addons = await getAddons("shop");

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header className="mb-6 sm:mb-8">
        <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-primary">
          Puja Add-ons
        </p>
        <h1 className="mt-1 font-bhor-display text-bhor-h3-mobile font-bhor-semibold text-bhor-text md:text-bhor-h2">
          Complete Your Puja
        </h1>
        <p className="mt-2 max-w-2xl text-bhor-small leading-bhor-body text-bhor-text-muted">
          Small extras that finish a puja thali. Add them to any BHORKIT kit order — they are delivered
          alongside your kit.
        </p>
      </header>

      {addons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-bhor-border px-6 py-12 text-center">
          <p className="text-bhor-small font-bhor-semibold text-bhor-text">No add-ons available right now</p>
          <p className="mt-1 text-bhor-caption text-bhor-text-muted">
            Please check back soon.
          </p>
        </div>
      ) : (
        <AddonGrid addons={addons} />
      )}
    </main>
  );
}
