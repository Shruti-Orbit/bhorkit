"use client";

import { useEffect, useMemo, useState } from "react";
import type { CollectionProduct } from "@/src/data/products";
import { ProductCollection } from "@/src/components/home/product-collection/ProductCollection";

type RecentlyViewedProductsProps = {
  currentProduct: CollectionProduct;
  products: CollectionProduct[];
  fallbackProducts?: CollectionProduct[];
};

const storageKey = "bhorkit_recently_viewed";

export function RecentlyViewedProducts({
  currentProduct,
  products,
  fallbackProducts = [],
}: RecentlyViewedProductsProps) {
  // Starts empty to match what the server renders. Reading localStorage in the
  // initialiser meant a returning visitor's first client render listed their
  // recently-viewed products while the server-rendered HTML showed the
  // fallbacks — a hydration mismatch that makes React throw the subtree away
  // and rebuild it. The history is read after mount instead.
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    const previous = stored ? safelyParseSlugs(stored) : [];

    // Deferred a tick so this isn't a synchronous setState in an effect body
    // (react-hooks/set-state-in-effect).
    queueMicrotask(() => setRecentSlugs(previous));

    // Records this visit regardless, so the history is still written on a
    // first-ever visit when there was nothing to restore.
    const nextSlugs = [
      currentProduct.slug,
      ...previous.filter((slug) => slug !== currentProduct.slug),
    ].slice(0, 8);
    window.localStorage.setItem(storageKey, JSON.stringify(nextSlugs));
  }, [currentProduct.slug]);

  const recentlyViewed = useMemo(() => {
    const storedProducts = recentSlugs
        .map((slug) => products.find((product) => product.slug === slug))
        .filter((product): product is CollectionProduct => Boolean(product))
        .filter((product) => product.slug !== currentProduct.slug)
        .slice(0, 4);

    return storedProducts.length > 0 ? storedProducts : fallbackProducts.slice(0, 4);
  }, [currentProduct.slug, fallbackProducts, products, recentSlugs]);

  if (recentlyViewed.length === 0) {
    return null;
  }

  return <ProductCollection title="Recently Viewed" href="/shop" products={recentlyViewed} />;
}

function safelyParseSlugs(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}
