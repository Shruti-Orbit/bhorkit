"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, X } from "lucide-react";
import { shopCategoryLabel } from "@/src/data/shopCategories";
import type { CollectionProduct } from "@/src/data/products";
import { HighlightedText } from "@/src/components/search/HighlightedText";
import { useProductSearch } from "@/src/lib/search/useProductSearch";
import { useSearchSuggestions } from "@/src/lib/search/useSearchSuggestions";

const DROPDOWN_LIMIT = 6;

export function SearchBox() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const { results, isLoading, isError, activeQuery } = useProductSearch(query, { limit: DROPDOWN_LIMIT });
  const { categories, recentlyViewed } = useSearchSuggestions();

  const hasQuery = query.trim().length > 0;
  const showViewAllRow = hasQuery && !isLoading && !isError && results.length > 0;
  const rowCount = results.length + (showViewAllRow ? 1 : 0);

  // Reset the keyboard-highlighted row whenever the query changes. Adjusted
  // during render (React's "storing information from previous renders"
  // pattern) rather than in an effect, so it doesn't cost an extra commit.
  const [queryForActiveIndex, setQueryForActiveIndex] = useState(query);
  if (query !== queryForActiveIndex) {
    setQueryForActiveIndex(query);
    setActiveIndex(-1);
  }

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  function close() {
    setIsOpen(false);
    setQuery("");
    setActiveIndex(-1);
  }

  function goToProduct(index: number) {
    const item = results[index];
    if (!item) return;
    close();
    router.push(item.product.href);
  }

  function goToFullResults(rawQuery: string) {
    const trimmed = rawQuery.trim();
    if (!trimmed) return;
    close();
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!hasQuery || rowCount === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % rowCount);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current - 1 + rowCount) % rowCount);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeIndex >= 0 && activeIndex < results.length) {
        goToProduct(activeIndex);
      } else {
        goToFullResults(activeQuery || query);
      }
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Search"
        onClick={() => setIsOpen(true)}
        className="flex h-11 w-11 items-center justify-center text-bhor-text transition-colors hover:text-bhor-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
      >
        <Search className="h-6 w-6" aria-hidden />
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[80] lg:flex lg:items-start lg:justify-center lg:px-4 lg:pt-24">
          <button
            type="button"
            aria-label="Close search"
            onClick={close}
            className="absolute inset-0 hidden bg-bhor-text/35 lg:block"
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            className="relative flex h-full w-full flex-col bg-bhor-surface lg:h-auto lg:max-h-[80vh] lg:max-w-2xl lg:rounded-bhor-lg lg:border lg:border-bhor-border lg:shadow-bhor-soft"
          >
            <div className="flex items-center gap-3 border-b border-bhor-border p-4">
              <Search className="h-5 w-5 shrink-0 text-bhor-primary" aria-hidden />
              <input
                ref={inputRef}
                autoFocus
                type="search"
                role="combobox"
                aria-expanded={isOpen}
                aria-controls="search-results-list"
                aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Search puja kits, festivals, essentials"
                className="min-h-12 min-w-0 flex-1 bg-transparent text-bhor-body text-bhor-text outline-none placeholder:text-bhor-text-muted"
              />
              {query ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center text-bhor-text-muted hover:text-bhor-primary"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              ) : null}
              <button
                type="button"
                aria-label="Close search"
                onClick={close}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bhor-cream text-bhor-text hover:text-bhor-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div id="search-results-list" className="flex-1 overflow-y-auto p-4 lg:max-h-[60vh]">
              {!hasQuery ? (
                <SearchSuggestions
                  categories={categories}
                  recentlyViewed={recentlyViewed}
                  onPickCategory={(category) => setQuery(category)}
                />
              ) : isLoading ? (
                <p className="py-8 text-center text-bhor-small text-bhor-text-muted">Searching…</p>
              ) : isError ? (
                <p className="py-8 text-center text-bhor-small text-bhor-text-muted">
                  Couldn&apos;t load search right now. Please try again.
                </p>
              ) : results.length === 0 ? (
                <NoResults query={activeQuery} />
              ) : (
                <ul className="space-y-1">
                  {results.map((result, index) => (
                    <li key={result.product.id}>
                      <Link
                        id={`search-result-${index}`}
                        href={result.product.href}
                        onClick={close}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={`flex items-center gap-3 rounded-bhor-sm p-2 transition-colors ${
                          activeIndex === index ? "bg-bhor-primary-soft" : "hover:bg-bhor-cream"
                        }`}
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-bhor-sm bg-bhor-peach">
                          <Image
                            src={result.product.image}
                            alt={result.product.imageAlt}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-bhor-small font-bhor-semibold text-bhor-text">
                            <HighlightedText text={result.product.name} ranges={result.nameMatchRanges} />
                          </p>
                          <p className="truncate text-bhor-caption text-bhor-text-muted">{shopCategoryLabel(result.product.shopCategory)}</p>
                        </div>
                        <p className="shrink-0 text-bhor-small font-bhor-bold text-bhor-text">{result.product.price}</p>
                      </Link>
                    </li>
                  ))}
                  {showViewAllRow ? (
                    <li>
                      <button
                        id={`search-result-${results.length}`}
                        type="button"
                        onClick={() => goToFullResults(activeQuery || query)}
                        onMouseEnter={() => setActiveIndex(results.length)}
                        className={`flex w-full items-center justify-center gap-2 rounded-bhor-sm p-3 text-bhor-caption font-bhor-bold uppercase text-bhor-primary transition-colors ${
                          activeIndex === results.length ? "bg-bhor-primary-soft" : "hover:bg-bhor-cream"
                        }`}
                      >
                        View all results for &ldquo;{activeQuery || query}&rdquo;
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </button>
                    </li>
                  ) : null}
                </ul>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="py-8 text-center">
      <p className="text-bhor-small font-bhor-semibold text-bhor-text">No results for &ldquo;{query}&rdquo;.</p>
      <p className="mt-1 text-bhor-caption text-bhor-text-muted">
        Try a different word, or browse everything we have.
      </p>
      <Link
        href="/shop"
        className="mt-4 inline-flex min-h-10 items-center justify-center rounded-bhor-sm bg-bhor-primary px-4 text-bhor-caption font-bhor-bold uppercase text-white"
      >
        Browse All Products
      </Link>
    </div>
  );
}

function SearchSuggestions({
  categories,
  recentlyViewed,
  onPickCategory,
}: {
  categories: string[];
  recentlyViewed: CollectionProduct[];
  onPickCategory: (category: string) => void;
}) {
  if (categories.length === 0 && recentlyViewed.length === 0) {
    return (
      <p className="py-8 text-center text-bhor-small text-bhor-text-muted">
        Start typing to search puja kits and essentials.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {categories.length > 0 ? (
        <div>
          <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">
            Popular Categories
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => onPickCategory(category)}
                className="rounded-full border border-bhor-border px-3 py-1.5 text-bhor-caption font-bhor-semibold text-bhor-text hover:border-bhor-primary hover:text-bhor-primary"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {recentlyViewed.length > 0 ? (
        <div>
          <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">
            Recently Viewed
          </p>
          <ul className="mt-2 space-y-1">
            {recentlyViewed.map((product) => (
              <li key={product.id}>
                <Link
                  href={product.href}
                  className="flex items-center gap-3 rounded-bhor-sm p-2 hover:bg-bhor-cream"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-bhor-sm bg-bhor-peach">
                    <Image src={product.image} alt={product.imageAlt} fill sizes="48px" className="object-cover" />
                  </div>
                  <p className="truncate text-bhor-small font-bhor-semibold text-bhor-text">{product.name}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
