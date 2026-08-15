import { ProductCollection } from "@/src/components/home/product-collection/ProductCollection";
import type { CollectionProduct } from "@/src/data/products";
import { RecentlyViewedProducts } from "./RecentlyViewedProducts";

type ProductSectionsProps = {
  product: CollectionProduct;
  ganeshChaturthiProducts: CollectionProduct[];
  navratriUpcomingProducts: CollectionProduct[];
  relatedProducts: CollectionProduct[];
};

export function ProductSections({
  ganeshChaturthiProducts,
  navratriUpcomingProducts,
  product,
  relatedProducts,
}: ProductSectionsProps) {
  return (
    <>
      <section className="mx-auto max-w-[1512px] px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="font-bhor-display text-bhor-h2-mobile font-bhor-semibold text-bhor-text md:text-bhor-h2">
          Why You&apos;ll Love It
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {product.highlights.map((highlight) => (
            <article
              key={highlight.title}
              className="rounded-bhor-md border border-bhor-border bg-bhor-surface p-5 transition-transform hover:-translate-y-1"
            >
              <h3 className="text-bhor-product font-bhor-semibold text-bhor-text">{highlight.title}</h3>
              <p className="mt-2 text-bhor-small leading-bhor-body text-bhor-text-muted">
                {highlight.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <ProductCollection title="You May Also Like" href="/shop" products={relatedProducts} />
      ) : null}

      <ProductCollection
        title="Upcoming Products"
        href="/pre-order"
        products={navratriUpcomingProducts}
      />

      <RecentlyViewedProducts
        currentProduct={product}
        products={ganeshChaturthiProducts}
        fallbackProducts={relatedProducts}
      />
    </>
  );
}
