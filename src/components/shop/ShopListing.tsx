import { ProductCollection } from "@/src/components/home/product-collection/ProductCollection";
import type { CollectionProduct } from "@/src/data/products";

type ShopListingProps = {
  /** Small uppercase line above the heading, e.g. "Shop All". */
  eyebrow: string;
  /** Page heading. */
  title: string;
  /** Heading of the listing block itself. */
  listingTitle: string;
  /**
   * Target of the listing's "View All" link. Each listing page points at
   * itself, matching what /shop already did — this is the full listing, so
   * there is nowhere further to expand to.
   */
  listingHref: string;
  products: CollectionProduct[];
};

/**
 * The storefront's product listing page body — eyebrow, heading and grid.
 *
 * Extracted because /shop and /shop/ganesh-chaturthi were byte-for-byte
 * identical apart from three strings and the fetch that feeds them, and
 * /puja-kits would have been a third copy. Every listing now
 * renders through here, so the cards, spacing, typography and responsive
 * behaviour cannot drift apart between them.
 *
 * A server component, like the pages that use it: the products are fetched
 * on the server and the markup arrives complete, which is why there is no
 * client-side loading state to render.
 */
export function ShopListing({ eyebrow, title, listingTitle, listingHref, products }: ShopListingProps) {
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

      {products.length === 0 ? (
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
        <ProductCollection title={listingTitle} href={listingHref} products={products} />
      )}
    </main>
  );
}
