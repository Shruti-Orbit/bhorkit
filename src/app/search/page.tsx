"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SearchX } from "lucide-react";
import { ProductCard } from "@/src/components/home/product-collection/ProductCard";
import { useProductSearch } from "@/src/lib/search/useProductSearch";

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchResults />
    </Suspense>
  );
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const { results, isLoading, isError, activeQuery } = useProductSearch(query, { debounceMs: 0 });

  return (
    <main className="flex flex-1 flex-col bg-bhor-cream py-8">
      <section className="px-4 pb-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1512px]">
          <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-gold">Search</p>
          {activeQuery ? (
            <h1 className="mt-2 font-bhor-display text-bhor-h2-mobile font-bhor-semibold text-bhor-text md:text-bhor-h2">
              Results for &ldquo;{activeQuery}&rdquo;
            </h1>
          ) : (
            <h1 className="mt-2 font-bhor-display text-bhor-h2-mobile font-bhor-semibold text-bhor-text md:text-bhor-h2">
              Search BHORKIT
            </h1>
          )}
          {!isLoading && activeQuery ? (
            <p className="mt-2 text-bhor-small text-bhor-text-muted">
              {results.length} {results.length === 1 ? "product" : "products"} found
            </p>
          ) : null}
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1512px]">
          {!activeQuery ? (
            <EmptyState
              icon={<SearchX className="mx-auto h-9 w-9 text-bhor-primary" aria-hidden />}
              title="Search for puja kits and essentials"
              description="Use the search bar above to find products by name, festival or ingredient."
            />
          ) : isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-[350px] animate-pulse rounded-bhor-md bg-bhor-surface md:h-[445px]" />
              ))}
            </div>
          ) : isError ? (
            <EmptyState
              icon={<SearchX className="mx-auto h-9 w-9 text-bhor-primary" aria-hidden />}
              title="Couldn't load search results"
              description="Something went wrong loading the catalogue. Please try again in a moment."
            />
          ) : results.length === 0 ? (
            <EmptyState
              icon={<SearchX className="mx-auto h-9 w-9 text-bhor-primary" aria-hidden />}
              title={`No results for "${activeQuery}"`}
              description="Try a different word, or browse everything we have."
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {results.map(({ product }) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function EmptyState({
  description,
  icon,
  title,
}: {
  description: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="mx-auto max-w-xl rounded-bhor-lg border border-bhor-border bg-bhor-surface p-8 text-center shadow-bhor-soft">
      {icon}
      <h2 className="mt-4 font-bhor-display text-bhor-h3-mobile font-bhor-semibold text-bhor-text md:text-bhor-h3">
        {title}
      </h2>
      <p className="mt-3 text-bhor-small leading-bhor-body text-bhor-text-muted">{description}</p>
      <Link
        href="/shop"
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white"
      >
        Browse All Products
      </Link>
    </div>
  );
}
