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
  const [recentSlugs] = useState<string[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const stored = window.localStorage.getItem(storageKey);
    return stored ? safelyParseSlugs(stored) : [];
  });

  useEffect(() => {
    const nextSlugs = [
      currentProduct.slug,
      ...recentSlugs.filter((slug) => slug !== currentProduct.slug),
    ].slice(0, 8);

    window.localStorage.setItem(storageKey, JSON.stringify(nextSlugs));
  }, [currentProduct.slug, recentSlugs]);

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
