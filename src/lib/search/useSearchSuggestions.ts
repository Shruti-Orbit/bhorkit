"use client";

import { useEffect, useState } from "react";
import type { CollectionProduct } from "@/src/data/products";
import { getCatalog } from "@/src/lib/search/searchIndex";

// Same key RecentlyViewedProducts.tsx writes to on product detail pages, so
// search's suggestions line up with what the shopper has actually been
// looking at elsewhere on the site.
const recentlyViewedStorageKey = "bhorkit_recently_viewed";

export function useSearchSuggestions() {
  const [categories, setCategories] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<CollectionProduct[]>([]);

  useEffect(() => {
    let isActive = true;

    getCatalog()
      .then((products) => {
        if (!isActive) return;

        setCategories(Array.from(new Set(products.map((product) => product.category))));

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

function safelyParseSlugs(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}
