"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Card, EmptyState, ErrorState, LoadingState, PageHeader,
} from "@/src/components/admin/ui";
import { listCategories, type AdminCategory } from "@/src/lib/api/admin.api";

/**
 * The three Shop ranges, with live product counts.
 *
 * Read-only on purpose. A range is a stable slug that the storefront routes on
 * (/shop/<slug>) and that products are validated against, so there is nothing
 * to create, rename or delete here — renaming one would either be a cosmetic
 * no-op or a silent break of three public URLs.
 *
 * This page used to derive categories from whatever free text products happened
 * to carry, and offered a rename. That is exactly how the data went wrong:
 * every Navratri kit was labelled "Ganesh Puja", and an admin smoke test
 * invented a "Test Kits" category the Shop had no route for. Moving a product
 * between ranges is now an edit on the product, chosen from a fixed list.
 */
export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  const load = useCallback(() => {
    setState("loading");
    listCategories()
      .then((result) => {
        setCategories(result);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, []);

  // Deferred a tick rather than called straight from the effect body: `load`
  // flips state to "loading" immediately, which counts as a synchronous
  // setState in an effect (react-hooks/set-state-in-effect).
  useEffect(() => {
    queueMicrotask(load);
  }, [load]);

  return (
    <div>
      <PageHeader
        title="Shop categories"
        description="The three Shop ranges. Every product belongs to exactly one — change a product's range from its own page."
      />

      <Card>
        {state === "loading" ? (
          <LoadingState label="Loading categories…" />
        ) : state === "error" ? (
          <ErrorState message="Couldn't load categories." onRetry={load} />
        ) : categories.length === 0 ? (
          <EmptyState title="No categories" hint="The Shop ranges could not be read." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-bhor-small">
              <thead>
                <tr className="border-b border-bhor-border text-left">
                  <th className="px-4 py-2 text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">Category</th>
                  <th className="px-4 py-2 text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">Slug</th>
                  <th className="px-4 py-2 text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">Products</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.slug} className="border-b border-bhor-border last:border-0">
                    <td className="px-4 py-3 font-bhor-semibold text-bhor-text">{category.label}</td>
                    <td className="px-4 py-3 text-bhor-caption text-bhor-text-muted">{category.slug}</td>
                    <td className="px-4 py-3 text-bhor-text-muted">{category.products}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/products?shopCategory=${encodeURIComponent(category.slug)}`}
                          className="whitespace-nowrap rounded-bhor-sm border border-bhor-border px-3 py-1.5 text-bhor-caption font-bhor-bold uppercase text-bhor-text"
                        >
                          View products
                        </Link>
                        <Link
                          href={`/shop/${category.slug}`}
                          className="whitespace-nowrap rounded-bhor-sm border border-bhor-primary px-3 py-1.5 text-bhor-caption font-bhor-bold uppercase text-bhor-primary"
                        >
                          View on store
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
