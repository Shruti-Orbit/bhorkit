"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Card, ConfirmDialog, EmptyState, ErrorState, Field, LoadingState, PageHeader, Toast, inputClass,
} from "@/src/components/admin/ui";
import { listCategories, renameCategory, type AdminCategory } from "@/src/lib/api/admin.api";
import { ApiClientError } from "@/src/lib/api/client";

/**
 * Categories are derived from the products that carry them rather than stored
 * in a collection of their own. That keeps a single source of truth — a
 * category exists exactly as long as a product uses it — and avoids a second
 * table that can drift out of step with the catalogue.
 */
export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" }>({ message: "", tone: "success" });

  const [renaming, setRenaming] = useState<AdminCategory | null>(null);
  const [nextName, setNextName] = useState("");
  const [busy, setBusy] = useState(false);

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

  async function applyRename() {
    if (!renaming) return;
    setBusy(true);
    try {
      const result = await renameCategory(renaming.category, nextName.trim());
      setToast({
        message: `Renamed on ${result.updated} product${result.updated === 1 ? "" : "s"}.`,
        tone: "success",
      });
      setRenaming(null);
      setNextName("");
      load();
    } catch (error) {
      setToast({ message: error instanceof ApiClientError ? error.message : "Couldn't rename.", tone: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Categories come from the products using them. Renaming updates every product at once."
      />

      <Card>
        {state === "loading" ? (
          <LoadingState label="Loading categories…" />
        ) : state === "error" ? (
          <ErrorState message="Couldn't load categories." onRetry={load} />
        ) : categories.length === 0 ? (
          <EmptyState title="No categories yet" hint="Categories appear once products use them." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-bhor-small">
              <thead>
                <tr className="border-b border-bhor-border text-left">
                  <th className="px-4 py-2 text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">Category</th>
                  <th className="px-4 py-2 text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">Products</th>
                  <th className="px-4 py-2 text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">Collections</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.category} className="border-b border-bhor-border last:border-0">
                    <td className="px-4 py-3 font-bhor-semibold text-bhor-text">{category.category}</td>
                    <td className="px-4 py-3 text-bhor-text-muted">{category.products}</td>
                    <td className="px-4 py-3 text-bhor-caption text-bhor-text-muted">{category.collections.join(", ")}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/products?category=${encodeURIComponent(category.category)}`}
                          className="whitespace-nowrap rounded-bhor-sm border border-bhor-border px-3 py-1.5 text-bhor-caption font-bhor-bold uppercase text-bhor-text"
                        >
                          View products
                        </Link>
                        <button
                          type="button"
                          onClick={() => { setRenaming(category); setNextName(category.category); }}
                          className="whitespace-nowrap rounded-bhor-sm border border-bhor-primary px-3 py-1.5 text-bhor-caption font-bhor-bold uppercase text-bhor-primary"
                        >
                          Rename
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={renaming !== null}
        title="Rename category"
        message={`This updates the category on all ${renaming?.products ?? 0} product${renaming?.products === 1 ? "" : "s"} currently using "${renaming?.category ?? ""}".`}
        confirmLabel="Rename"
        busy={busy}
        onConfirm={applyRename}
        onCancel={() => setRenaming(null)}
      >
        <Field label="New name">
          <input value={nextName} onChange={(event) => setNextName(event.target.value)} className={inputClass} />
        </Field>
      </ConfirmDialog>

      <Toast message={toast.message} tone={toast.tone} onDone={() => setToast({ message: "", tone: "success" })} />
    </div>
  );
}
