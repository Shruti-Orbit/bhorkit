"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import {
  Card, ConfirmDialog, EmptyState, ErrorState, Field, LoadingState, PageHeader, Toast, inputClass,
} from "@/src/components/admin/ui";
import {
  createCategory, deleteCategory, getCategoriesOverview, updateCategory,
  type AdminCategory, type CategoryInput,
} from "@/src/lib/api/admin.api";
import { ApiClientError } from "@/src/lib/api/client";

/**
 * Shop categories.
 *
 * Each product belongs to one category by its slug, which is also the
 * storefront URL (/shop/<slug>). Changing a slug moves the category's products
 * with it and keeps the old URL redirecting. Hiding a category takes it and all
 * of its products off the storefront without touching them, so switching it
 * back on restores everything. A category can only be deleted once it has no
 * products.
 */

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_NAME = 60;
const MAX_SLUG = 60;
const MAX_DESCRIPTION = 200;

type Draft = {
  name: string;
  slug: string;
  description: string;
  sortOrder: string;
  isActive: boolean;
};

// sortOrder left blank means "after every existing category".
const BLANK: Draft = { name: "", slug: "", description: "", sortOrder: "", isActive: true };

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG)
    .replace(/-+$/g, "");
}

function draftFrom(category: AdminCategory): Draft {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description,
    sortOrder: String(category.sortOrder),
    isActive: category.isActive,
  };
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[] | null>(null);
  const [unclassified, setUnclassified] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [draft, setDraft] = useState<Draft>(BLANK);
  const [editingId, setEditingId] = useState("");
  // Until the admin types a slug by hand, it follows the name.
  const [slugTouched, setSlugTouched] = useState(false);
  const [removing, setRemoving] = useState<AdminCategory | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" }>({ message: "", tone: "success" });

  const load = useCallback(async () => {
    try {
      const loaded = await getCategoriesOverview();
      setLoadError("");
      setCategories(loaded.categories);
      setUnclassified(loaded.unclassified);
    } catch (caught) {
      setLoadError(caught instanceof ApiClientError ? caught.message : "Couldn't load categories.");
    }
  }, []);

  useEffect(() => { queueMicrotask(load); }, [load]);

  const dismissToast = useCallback(() => setToast({ message: "", tone: "success" }), []);

  async function run(action: () => Promise<unknown>, success: string, fallback: string) {
    setBusy(true);
    try {
      await action();
      await load();
      setToast({ message: success, tone: "success" });
      return true;
    } catch (caught) {
      setToast({ message: caught instanceof ApiClientError ? caught.message : fallback, tone: "error" });
      return false;
    } finally {
      setBusy(false);
    }
  }

  const editing = editingId ? categories?.find((category) => category.id === editingId) ?? null : null;
  const slug = draft.slug.trim();
  const slugValid = SLUG_PATTERN.test(slug) && slug.length <= MAX_SLUG;
  const valid = draft.name.trim().length > 0 && slugValid;
  const slugChanged = editing !== null && slug !== editing.slug;
  const nextPriority = Math.max(0, ...(categories ?? []).map((category) => category.sortOrder)) + 1;

  async function save() {
    if (!valid) return;
    const payload: CategoryInput = {
      name: draft.name.trim(),
      slug,
      description: draft.description.trim(),
      isActive: draft.isActive,
      sortOrder: draft.sortOrder.trim()
        ? Math.min(9999, Math.max(0, Math.trunc(Number(draft.sortOrder) || 0)))
        : nextPriority,
    };

    const ok = editingId
      ? await run(() => updateCategory(editingId, payload), `${payload.name} updated`, "Couldn't save that category.")
      : await run(() => createCategory(payload), `${payload.name} added`, "Couldn't add that category.");

    if (ok) cancelEdit();
  }

  function startEdit(category: AdminCategory) {
    setEditingId(category.id);
    setDraft(draftFrom(category));
    setSlugTouched(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId("");
    setDraft(BLANK);
    setSlugTouched(false);
  }

  function setName(name: string) {
    setDraft((d) => ({ ...d, name, ...(slugTouched ? {} : { slug: slugify(name) }) }));
  }

  if (loadError) return <ErrorState message={loadError} onRetry={() => void load()} />;
  if (!categories) return <LoadingState label="Loading categories…" />;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Shop categories"
        description="Every product belongs to one category. Priority sets the order on the homepage, menu and Shop page (1 shows first). Hidden categories, and all of their products, are taken off the storefront until you switch them back on."
      />

      <Card className="p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-bhor-small font-bhor-bold text-bhor-text">
            {editingId ? "Edit category" : "New category"}
          </h2>
          {editingId ? (
            <button
              type="button"
              onClick={cancelEdit}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-bhor-sm border border-bhor-border px-3 text-bhor-caption font-bhor-bold uppercase text-bhor-text-muted"
            >
              <X className="h-3.5 w-3.5" aria-hidden /> Cancel
            </button>
          ) : null}
        </div>

        <form
          onSubmit={(event) => { event.preventDefault(); void save(); }}
          className="grid gap-3 sm:grid-cols-2"
        >
          <Field label="Name">
            <input
              value={draft.name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Diwali 2026"
              maxLength={MAX_NAME}
              className={inputClass}
            />
          </Field>

          <Field label="Slug (used in the page URL)">
            <input
              value={draft.slug}
              onChange={(event) => {
                setSlugTouched(true);
                setDraft((d) => ({ ...d, slug: event.target.value.toLowerCase() }));
              }}
              placeholder="e.g. diwali-2026"
              maxLength={MAX_SLUG}
              className={`${inputClass} ${draft.slug && !slugValid ? "border-bhor-error" : ""}`}
            />
          </Field>

          <div className="sm:col-span-2 -mt-1 space-y-1 text-bhor-caption">
            <p className="text-bhor-text-muted">
              Shown at <span className="font-bhor-semibold text-bhor-text">/shop/{slug || "your-slug"}</span>. Lowercase letters, numbers and single hyphens only.
            </p>
            {slugChanged && editing ? (
              <p className="text-bhor-primary">
                {editing.products > 0
                  ? `${plural(editing.products, "product")} will move to the new slug. `
                  : ""}
                Links to /shop/{editing.slug} will redirect to the new address.
              </p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <Field label="Description (optional)">
              <textarea
                value={draft.description}
                onChange={(event) => setDraft((d) => ({ ...d, description: event.target.value }))}
                rows={2}
                maxLength={MAX_DESCRIPTION}
                placeholder="One line shown under the category in the menu and on the Shop page."
                className={`${inputClass} min-h-16 resize-y py-2`}
              />
            </Field>
          </div>

          <Field label="Display priority (1 shows first on the homepage)">
            <input
              type="number"
              min={0}
              max={9999}
              value={draft.sortOrder}
              onChange={(event) => setDraft((d) => ({ ...d, sortOrder: event.target.value }))}
              placeholder={String(nextPriority)}
              className={inputClass}
            />
          </Field>

          <div className="flex items-end">
            <label className="flex min-h-10 items-center gap-2 text-bhor-small text-bhor-text">
              <input
                type="checkbox"
                checked={draft.isActive}
                onChange={(event) => setDraft((d) => ({ ...d, isActive: event.target.checked }))}
                className="h-4 w-4 accent-bhor-primary"
              />
              Visible on the storefront
            </label>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={busy || !valid}
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button-mobile font-bhor-bold uppercase text-white disabled:opacity-50 sm:w-auto"
            >
              <Plus className="h-4 w-4" aria-hidden />
              {editingId ? "Save changes" : "Add category"}
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-bhor-border px-4 py-3">
          <h2 className="text-bhor-product font-bhor-bold text-bhor-text">
            Categories <span className="font-bhor-regular text-bhor-text-muted">({categories.length})</span>
          </h2>
          <p className="text-bhor-caption text-bhor-text-muted">
            A category with products can&apos;t be deleted — move its products first, or hide it.
          </p>
        </div>

        {categories.length === 0 ? (
          <EmptyState title="No categories yet" hint="Create one above, then assign products to it." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-bhor-small">
              <thead>
                <tr className="border-b border-bhor-border text-left">
                  <th className="px-4 py-2 text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">Priority</th>
                  <th className="px-4 py-2 text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">Category</th>
                  <th className="px-4 py-2 text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">Slug</th>
                  <th className="px-4 py-2 text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">Products</th>
                  <th className="px-4 py-2 text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">Visible</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className={`border-b border-bhor-border last:border-0 ${category.isActive ? "" : "bg-bhor-cream/60"}`}
                  >
                    <td className="px-4 py-3 font-bhor-semibold text-bhor-text">{category.sortOrder}</td>
                    <td className="px-4 py-3">
                      <p className="font-bhor-semibold text-bhor-text">{category.name}</p>
                      <p className="mt-0.5 line-clamp-1 text-bhor-caption text-bhor-text-muted">
                        {category.description || "No description"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-bhor-caption text-bhor-text-muted">
                      <p>{category.slug}</p>
                      {category.previousSlugs.length > 0 ? (
                        <p className="mt-0.5" title="Old addresses that redirect here">
                          was {category.previousSlugs.join(", ")}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-bhor-text-muted">{category.products}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={category.isActive}
                        aria-label={`Show ${category.name} on the storefront`}
                        disabled={busy}
                        onClick={() =>
                          void run(
                            () => updateCategory(category.id, { isActive: !category.isActive }),
                            category.isActive
                              ? `${category.name} hidden from the storefront`
                              : `${category.name} is visible again`,
                            "Couldn't update that category.",
                          )
                        }
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${category.isActive ? "bg-bhor-primary" : "bg-bhor-border"}`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${category.isActive ? "left-[22px]" : "left-0.5"}`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products?shopCategory=${encodeURIComponent(category.slug)}`}
                          className="whitespace-nowrap rounded-bhor-sm border border-bhor-border px-3 py-1.5 text-bhor-caption font-bhor-bold uppercase text-bhor-text"
                        >
                          View products
                        </Link>
                        {category.isActive ? (
                          <Link
                            href={`/shop/${category.slug}`}
                            className="whitespace-nowrap rounded-bhor-sm border border-bhor-primary px-3 py-1.5 text-bhor-caption font-bhor-bold uppercase text-bhor-primary"
                          >
                            View on store
                          </Link>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => startEdit(category)}
                          aria-label={`Edit ${category.name}`}
                          className="rounded-bhor-sm border border-bhor-border p-2 text-bhor-text"
                        >
                          <Pencil className="h-4 w-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRemoving(category)}
                          disabled={category.products > 0}
                          aria-label={`Delete ${category.name}`}
                          title={
                            category.products > 0
                              ? `Move its ${plural(category.products, "product")} to another category first`
                              : `Delete ${category.name}`
                          }
                          className="rounded-bhor-sm border border-bhor-border p-2 text-bhor-error disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {unclassified > 0 ? (
          <p className="border-t border-bhor-border px-4 py-3 text-bhor-caption text-bhor-text-muted">
            {plural(unclassified, "product")} belong to no category and are not shown on the storefront.
          </p>
        ) : null}
      </Card>

      <ConfirmDialog
        open={removing !== null}
        title={`Delete ${removing?.name ?? "this category"}?`}
        message="It will be removed from the storefront menu and its page will stop working. Past orders are unaffected. To take it off the storefront without deleting it, switch it off instead."
        confirmLabel="Delete"
        destructive
        busy={busy}
        onCancel={() => setRemoving(null)}
        onConfirm={() => {
          const target = removing;
          if (!target) return;
          setRemoving(null);
          void run(() => deleteCategory(target.id), `${target.name} deleted`, "Couldn't delete that category.");
        }}
      />

      <Toast message={toast.message} tone={toast.tone} onDone={dismissToast} />
    </div>
  );
}
