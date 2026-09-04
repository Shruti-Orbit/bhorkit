import { ProductCollection } from "@/src/components/home/product-collection/ProductCollection";
import type { CollectionProduct } from "@/src/data/products";

export type ShopListingSection = {
  /** React key, and the reason this section exists — a category or state slug. */
  key: string;
  /** Heading of the section. */
  title: string;
  /** Optional one-liner under the heading. */
  description?: string;
  /**
   * Target of the section's "View All" link. Omitted where the section is
   * already showing everything it could — Shop All's own groups have nowhere
   * further to expand to.
   */
  href?: string;
  tone?: "default" | "muted";
  variant?: "primary" | "regular" | "upcoming";
  products: CollectionProduct[];
};

type ShopListingProps = {
  /** Small uppercase line above the heading, e.g. "Shop All". */
  eyebrow: string;
  /** Page heading. */
  title: string;
  /**
   * The blocks of products to render, in order. A single-range page passes one
   * section; Shop All passes one per purchase state.
   */
  sections: ShopListingSection[];
};

/**
 * The storefront's product listing page body — eyebrow, heading and the
 * product blocks beneath it.
 *
 * Extracted because /shop and /shop/ganesh-chaturthi were byte-for-byte
 * identical apart from three strings and the fetch that feeds them, and
 * /puja-kits would have been a third copy. Every listing now renders through
 * here, so the cards, spacing, typography and responsive behaviour cannot
 * drift apart between them.
 *
 * Takes a list of sections rather than a flat product array: Shop All groups
 * its catalogue into Ready Stock / Pre-Order / Coming Soon, while a single
 * range renders as one section. Both shapes go through the same component, so
 * the grouped page cannot drift from the ungrouped ones either.
 *
 * A server component, like the pages that use it: the products are fetched
 * on the server and the markup arrives complete, which is why there is no
 * client-side loading state to render.
 */
export function ShopListing({ eyebrow, title, sections }: ShopListingProps) {
  // An empty section is dropped rather than rendered as an empty heading: a
  // range with nothing in it should not leave a title stranded above a gap.
  const populatedSections = sections.filter(
    (section) => section.products.length > 0,
  );

  return (
    <main className="flex flex-1 flex-col bg-bhor-cream py-8">
      <section className="px-4 pb-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1512px]">
          <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-gold">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-bhor-display text-bhor-h2-mobile font-bhor-semibold text-bhor-text md:text-bhor-h2">
            {title}
          </h1>
        </div>
      </section>

      {populatedSections.length === 0 ? (
        <section className="px-4 pb-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1512px] rounded-bhor-sm border border-bhor-border bg-bhor-surface px-6 py-12 text-center">
            <p className="text-bhor-body font-bhor-semibold text-bhor-text">
              Nothing here just yet
            </p>
            <p className="mt-1 text-bhor-small text-bhor-text-muted">
              These kits are being restocked. Please check back shortly.
            </p>
          </div>
        </section>
      ) : (
        populatedSections.map((section) => (
          <ProductCollection
            key={section.key}
            title={section.title}
            description={section.description}
            href={section.href}
            tone={section.tone}
            variant={section.variant}
            products={section.products}
          />
        ))
      )}
    </main>
  );
}
