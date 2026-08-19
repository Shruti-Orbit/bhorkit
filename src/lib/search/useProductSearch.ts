"use client";

import { useEffect, useState } from "react";
import { searchProducts, type ProductSearchResult } from "@/src/lib/search/searchIndex";

type UseProductSearchOptions = {
  limit?: number;
  debounceMs?: number;
};

export function useProductSearch(query: string, options: UseProductSearchOptions = {}) {
  const { limit, debounceMs = 150 } = options;
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [results, setResults] = useState<ProductSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), debounceMs);
    return () => window.clearTimeout(timer);
  }, [query, debounceMs]);

  useEffect(() => {
    let isActive = true;
    const trimmed = debouncedQuery.trim();

    if (!trimmed) {
      // Deferred a tick so this doesn't set state synchronously within the
      // effect body (react-hooks/set-state-in-effect).
      queueMicrotask(() => {
        if (!isActive) return;
        setResults([]);
        setIsLoading(false);
        setIsError(false);
      });
      return;
    }

    queueMicrotask(() => {
      if (isActive) setIsLoading(true);
    });

    searchProducts(trimmed, limit)
      .then((found) => {
        if (!isActive) return;
        setResults(found);
        setIsError(false);
      })
      .catch(() => {
        if (!isActive) return;
        setResults([]);
        setIsError(true);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [debouncedQuery, limit]);

  return { results, isLoading, isError, activeQuery: debouncedQuery.trim() };
}
