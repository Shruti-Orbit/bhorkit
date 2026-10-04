"use client";

import { useEffect, useState } from "react";
import { isInRange, productCategoryLabel } from "@/src/data/shopCategories";
import type { CollectionProduct, ShopCategorySlug } from "@/src/data/products";
import { getCatalog } from "@/src/lib/search/searchIndex";

export type SearchSuggestionCategory = {
  label: string;
  href: string;
};

// Same key RecentlyViewedProducts.tsx writes to on product detail pages, so
// search's suggestions line up with what the shopper has actually been
// looking at elsewhere on the site.
const recentlyViewedStorageKey = "bhorkit_recently_viewed";
const popularCategoryOrder: ShopCategorySlug[] = [
  "regular-pooja",
  "navratri-upcoming",
  "ganesh-chaturthi",
];

export function useSearchSuggestions() {
  const [categories, setCategories] = useState<SearchSuggestionCategory[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<CollectionProduct[]>([]);

  useEffect(() => {
    let isActive = true;

    getCatalog()
      .then((products) => {
        if (!isActive) return;

        setCategories(categoriesFrom(products));

        const stored = window.localStorage.getItem(recentlyViewedStorageKey);
        const slugs = stored ? safelyParseSlugs(stored) : [];
        const resolved = slugs
          .map((slug) => products.find((product) => product.slug === slug))
          .filter((product): product is CollectionProduct => Boolean(product))
          .slice(0, 4);
        setRecentlyViewed(resolved);
      })
      .catch(() => {
        if (!isActive) return;
        setCategories([]);
        setRecentlyViewed([]);
      });

    return () => {
      isActive = false;
    };
  }, []);

  return { categories, recentlyViewed };
}

/**
 * The categories that have products in the catalogue, the popular ones first.
 * Read off the products themselves, which only include visible categories.
 */
function categoriesFrom(products: CollectionProduct[]): SearchSuggestionCategory[] {
  const bySlug = new Map<string, CollectionProduct>();
  for (const product of products) {
    if (!bySlug.has(product.shopCategory)) bySlug.set(product.shopCategory, product);
  }
  const rank = (product: CollectionProduct) => {
    const index = popularCategoryOrder.findIndex((slug) => isInRange(product, slug));
    return index === -1 ? popularCategoryOrder.length : index;
  };
  return [...bySlug.values()]
    .sort((a, b) => rank(a) - rank(b))
    .map((product) => ({
      label: productCategoryLabel(product),
      href: `/shop/${product.shopCategory}`,
    }));
}

function safelyParseSlugs(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}
