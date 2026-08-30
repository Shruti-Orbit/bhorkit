"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProductsByShopCategory } from "@/src/lib/api/product.api";
import type { CollectionProduct } from "@/src/data/products";

/**
 * The Trending column: the Ganesh Chaturthi range, straight from the catalogue.
 *
 * Fetched rather than listed here so the footer follows the shop. A product
 * renamed, added or retired in the admin panel shows up without anyone editing
 * this file, which is the whole reason it is not a static array of links like
 * the columns beside it.
 *
 * A client component on purpose: the footer sits in the storefront layout, so
 * fetching it on the server would make every page under that layout dynamic to
 * populate one column. Failing quietly is deliberate too — the column simply
 * does not render, and the rest of the footer is unaffected.
 */
export function FooterTrending() {
  const [products, setProducts] = useState<CollectionProduct[]>([]);

  useEffect(() => {
    let active = true;

    getProductsByShopCategory("ganesh-chaturthi")
      .then((loaded) => {
        if (active) setProducts(loaded);
      })
      .catch(() => {
        // The footer is navigation, not content — if the catalogue cannot be
        // reached the column stays empty rather than showing an error in it.
      });

    return () => {
      active = false;
    };
  }, []);

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
