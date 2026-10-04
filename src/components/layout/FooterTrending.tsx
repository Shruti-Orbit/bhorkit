import Link from "next/link";
import type { CollectionProduct } from "@/src/data/products";

/**
 * The Trending column: the products of the top-priority category in
 * Admin > Categories, so it follows whichever festival is leading the shop.
 * Renders nothing when there is nothing to list, leaving the rest of the
 * footer unaffected.
 */
export function FooterTrending({ products }: { products: CollectionProduct[] }) {
  if (products.length === 0) return null;

  return (
    <nav aria-label="Trending">
      <h2 className="text-bhor-small font-bhor-bold uppercase tracking-wide text-bhor-gold-light">
        Trending
      </h2>
      <ul className="mt-4 space-y-2">
        {products.map((product) => (
          <li key={product.id}>
            <Link
              href={`/products/${product.slug}`}
              className="block text-bhor-small text-white/80 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-gold-light"
            >
              {product.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
