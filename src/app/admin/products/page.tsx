"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Card, ConfirmDialog, EmptyState, ErrorState, Field, LoadingState, PageHeader, Pagination, Toast, inputClass,
} from "@/src/components/admin/ui";
import {
  deleteProduct, listProducts, setProductActive, type AdminPageMeta, type AdminProduct,
} from "@/src/lib/api/admin.api";
import { ApiClientError } from "@/src/lib/api/client";

const AVAILABILITY = ["available", "preorder", "unavailable"];
const COLLECTIONS = ["ganesh-chaturthi", "navratri-upcoming", "regular-pooja"];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [meta, setMeta] = useState<AdminPageMeta>({ total: 0, page: 1, limit: 20 });
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" }>({ message: "", tone: "success" });

  const [search, setSearch] = useState("");
  const [collection, setCollection] = useState("");
  const [availability, setAvailability] = useState("");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);

  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AdminProduct | null>(null);

  const load = useCallback(() => {
    setState("loading");
    listProducts({ search, collection, availability, sort, page, limit: 20 })
      .then((result) => {
        setProducts(result.products);
        if (result.meta) setMeta(result.meta);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, [search, collection, availability, sort, page]);

  useEffect(() => {
    const timer = window.setTimeout(load, 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function toggleActive(product: AdminProduct) {
    setBusy(true);
    try {
      const next = product.availability === "unavailable";
      await setProductActive(product.id, next);
      setToast({ message: next ? "Product activated." : "Product deactivated.", tone: "success" });
      load();
    } catch (error) {
      setToast({ message: error instanceof ApiClientError ? error.message : "Couldn't update the product.", tone: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setBusy(true);
    try {
      await deleteProduct(pendingDelete.id);
      setToast({ message: "Product deleted.", tone: "success" });
      setPendingDelete(null);
      load();
    } catch (error) {
      // The server refuses to delete a product any order references; its
      // message names the count, which is more useful than a generic error.
      setToast({ message: error instanceof ApiClientError ? error.message : "Couldn't delete the product.", tone: "error" });
      setPendingDelete(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage the catalogue."
        action={
          <Link
            href="/admin/products/new"
            className="min-h-10 rounded-bhor-sm bg-bhor-primary px-4 py-2 text-bhor-button-mobile font-bhor-bold uppercase text-white"
          >
            New product
          </Link>
        }
      />

      <Card className="mb-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Search">
            <input
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              placeholder="Name, SKU, slug or category"
              className={inputClass}
            />
          </Field>
          <Field label="Collection">
            <select value={collection} onChange={(event) => { setCollection(event.target.value); setPage(1); }} className={inputClass}>
              <option value="">All collections</option>
              {COLLECTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </Field>
          <Field label="Availability">
            <select value={availability} onChange={(event) => { setAvailability(event.target.value); setPage(1); }} className={inputClass}>
              <option value="">All</option>
              {AVAILABILITY.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </Field>
          <Field label="Sort">
            <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} className={inputClass}>
              <option value="recent">Recently updated</option>
              <option value="name">Name</option>
              <option value="priceAsc">Price: low to high</option>
              <option value="priceDesc">Price: high to low</option>
            </select>
          </Field>
        </div>
      </Card>

      <Card>
        {state === "loading" ? (
          <LoadingState label="Loading products…" />
        ) : state === "error" ? (
          <ErrorState message="Couldn't load products." onRetry={load} />
        ) : products.length === 0 ? (
          <EmptyState title="No products match these filters" hint="Try clearing the search." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-bhor-small">
                <thead>
                  <tr className="border-b border-bhor-border text-left">
                    <Th>Product</Th><Th>SKU</Th><Th>Category</Th><Th>Price</Th><Th>Availability</Th><Th />
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-bhor-border last:border-0">
                      <td className="max-w-[280px] px-4 py-3">
                        <p className="truncate font-bhor-semibold text-bhor-text">{product.name}</p>
                        <p className="truncate text-bhor-caption text-bhor-text-muted">{product.catalogCollection}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-bhor-text-muted">{product.sku}</td>
                      <td className="px-4 py-3 text-bhor-text-muted">{product.category}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-bhor-text">{product.price}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-bhor-sm px-2 py-1 text-bhor-badge font-bhor-bold uppercase ${
                            product.availability === "unavailable"
                              ? "bg-bhor-cream text-bhor-text-muted"
                              : "bg-bhor-primary-soft text-bhor-primary"
                          }`}
                        >
                          {product.availability}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/products/${encodeURIComponent(product.id)}`}
                            className="whitespace-nowrap rounded-bhor-sm border border-bhor-primary px-3 py-1.5 text-bhor-caption font-bhor-bold uppercase text-bhor-primary"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => toggleActive(product)}
                            className="whitespace-nowrap rounded-bhor-sm border border-bhor-border px-3 py-1.5 text-bhor-caption font-bhor-bold uppercase text-bhor-text disabled:opacity-50"
                          >
                            {product.availability === "unavailable" ? "Activate" : "Deactivate"}
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => setPendingDelete(product)}
                            className="whitespace-nowrap rounded-bhor-sm px-3 py-1.5 text-bhor-caption font-bhor-bold uppercase text-bhor-error disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={meta.page} limit={meta.limit} total={meta.total} onPage={setPage} />
          </>
        )}
      </Card>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this product?"
        message={`"${pendingDelete?.name ?? ""}" will be removed permanently. Products that appear on existing orders can't be deleted — deactivate those instead so order history stays intact.`}
        confirmLabel="Delete"
        destructive
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <Toast message={toast.message} tone={toast.tone} onDone={() => setToast({ message: "", tone: "success" })} />
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="px-4 py-2 text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">{children}</th>
  );
}
