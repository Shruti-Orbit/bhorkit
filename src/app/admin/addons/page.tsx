"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import {
  Card, ConfirmDialog, EmptyState, ErrorState, Field, LoadingState, PageHeader, Toast, inputClass,
} from "@/src/components/admin/ui";
import {
  createAddon, deleteAddon, getAddons, updateAddon,
  type AdminAddon, type AdminAddonImage,
} from "@/src/lib/api/admin.api";
import { ImageField, addonImageApi, usePendingUploads } from "@/src/components/admin/product/ImageUploader";
import { ApiClientError } from "@/src/lib/api/client";
import { formatPaise } from "@/src/utils/money";

/**
 * Puja Add-ons.
 *
 * Standalone by design: nothing here reads the inventory, and nothing in the
 * inventory knows add-ons exist. An add-on is a saleable thing with its own
 * name, price, photo and merchandising priority — not a stock row.
 *
 * Priority decides WHERE an add-on appears and nothing else:
 *   Normal        — the Puja Add-ons page only
 *   Priority      — also "Complete Your Puja" on every product page
 *   High priority — the above, plus "Don't Forget" at checkout
 */

const PRIORITIES = [
  { value: "normal", label: "Normal", hint: "Puja Add-ons page only" },
  { value: "priority", label: "Priority", hint: "Also on product pages" },
  { value: "high", label: "High priority", hint: "Also at checkout" },
] as const;

const MIN_PRICE_PAISE = 100;
const MAX_PRICE_PAISE = 5_000_000;

type Draft = {
  name: string;
  description: string;
  price: string;
  unit: string;
  priority: "normal" | "priority" | "high";
  image: AdminAddonImage | null;
  active: boolean;
  sortOrder: string;
};

const BLANK: Draft = {
  name: "",
  description: "",
  price: "",
  unit: "piece",
  priority: "normal",
  image: null,
  active: true,
  sortOrder: "0",
};

/** Rupees typed into a form, as whole paise. NaN when it isn't a number. */
function toPaise(value: string) {
  const rupees = Number(value);
  return value.trim() && Number.isFinite(rupees) ? Math.round(rupees * 100) : NaN;
}

function priceValid(paise: number) {
  return Number.isInteger(paise) && paise >= MIN_PRICE_PAISE && paise <= MAX_PRICE_PAISE;
}

function draftFrom(addon: AdminAddon): Draft {
  return {
    name: addon.name,
    description: addon.description,
    price: String(addon.pricePaise / 100),
    unit: addon.unit,
    priority: addon.priority,
    image: addon.image,
    active: addon.active,
    sortOrder: String(addon.sortOrder),
  };
}

export default function AdminAddonsPage() {
  const [addons, setAddons] = useState<AdminAddon[] | null>(null);
  const [units, setUnits] = useState<string[]>(["piece"]);
  const [loadError, setLoadError] = useState("");
  const [draft, setDraft] = useState<Draft>(BLANK);
  const [editingId, setEditingId] = useState("");
  const [removing, setRemoving] = useState<AdminAddon | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" }>({ message: "", tone: "success" });
  // Photos uploaded in this sitting that no add-on references yet.
  const pendingUploads = usePendingUploads();

  const load = useCallback(async () => {
    try {
      const loaded = await getAddons();
      setLoadError("");
      setAddons(loaded.addons);
      if (loaded.units.length > 0) setUnits(loaded.units);
    } catch (caught) {
      setLoadError(caught instanceof ApiClientError ? caught.message : "Couldn't load add-ons.");
    }
  }, []);

  useEffect(() => { queueMicrotask(load); }, [load]);

  const dismissToast = useCallback(() => setToast({ message: "", tone: "success" }), []);

  async function run(action: () => Promise<unknown>, success: string, fallback: string) {
    setBusy(true);
    try {
      await action();
      await load();
      // Saved, so every uploaded photo is now referenced by an add-on.
      pendingUploads.clear();
      setToast({ message: success, tone: "success" });
      return true;
    } catch (caught) {
      setToast({ message: caught instanceof ApiClientError ? caught.message : fallback, tone: "error" });
      return false;
    } finally {
      setBusy(false);
    }
  }

  const price = toPaise(draft.price);
  const valid = draft.name.trim().length > 0 && priceValid(price);

  async function save() {
    if (!valid) return;
    const payload = {
      name: draft.name.trim(),
      description: draft.description.trim(),
      pricePaise: price,
      unit: draft.unit,
      priority: draft.priority,
      // Always sent from this form, because the form always shows the current
      // photo — so null here genuinely means "the admin removed it".
      image: draft.image,
      active: draft.active,
      sortOrder: Number(draft.sortOrder) || 0,
    };

    const ok = editingId
      ? await run(() => updateAddon(editingId, payload), `${payload.name} updated`, "Couldn't save that add-on.")
      : await run(() => createAddon(payload), `${payload.name} added`, "Couldn't add that add-on.");

    if (ok) {
      setDraft(BLANK);
      setEditingId("");
    }
  }

  function startEdit(addon: AdminAddon) {
    setEditingId(addon.id);
    setDraft(draftFrom(addon));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId("");
    setDraft(BLANK);
  }

  if (loadError) return <ErrorState message={loadError} onRetry={() => void load()} />;
  if (!addons) return <LoadingState label="Loading add-ons…" />;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Puja Add-ons"
        description="Small extras customers add alongside a kit. Independent of Inventory — each add-on has its own name, price and photo."
      />

      <Card className="p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-bhor-small font-bhor-bold text-bhor-text">
            {editingId ? "Edit add-on" : "New add-on"}
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
              onChange={(event) => setDraft((d) => ({ ...d, name: event.target.value }))}
              placeholder="e.g. Fresh Marigold Garland"
              maxLength={80}
              className={inputClass}
            />
          </Field>

          <Field label="Price (₹)">
            <input
              type="number"
              min={1}
              step="0.01"
              inputMode="decimal"
              value={draft.price}
              onChange={(event) => setDraft((d) => ({ ...d, price: event.target.value }))}
              placeholder="e.g. 40"
              className={`${inputClass} ${draft.price && !priceValid(price) ? "border-bhor-error" : ""}`}
            />
          </Field>

          <Field label="Sold by">
            <select
              value={draft.unit}
              onChange={(event) => setDraft((d) => ({ ...d, unit: event.target.value }))}
              className={inputClass}
            >
              {units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
            </select>
          </Field>

          <Field label="Priority">
            <select
              value={draft.priority}
              onChange={(event) => setDraft((d) => ({ ...d, priority: event.target.value as Draft["priority"] }))}
              className={inputClass}
            >
              {PRIORITIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} — {option.hint}
                </option>
              ))}
            </select>
          </Field>

          <div className="sm:col-span-2">
            <Field label="Description (optional)">
              <textarea
                value={draft.description}
                onChange={(event) => setDraft((d) => ({ ...d, description: event.target.value }))}
                rows={2}
                maxLength={300}
                placeholder="One line shown under the name on the add-on card."
                className={`${inputClass} min-h-16 resize-y py-2`}
              />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <ImageField
              label="Photo"
              hint="Shown on every surface that offers this add-on. Square images look best. JPEG, PNG, WebP or AVIF, up to 5MB."
              value={{ src: draft.image?.src ?? "", publicId: draft.image?.publicId }}
              pending={pendingUploads}
              api={addonImageApi}
              onChange={(next) =>
                setDraft((d) => ({
                  ...d,
                  image: next.src && next.publicId ? { src: next.src, publicId: next.publicId } : null,
                }))
              }
            />
          </div>

          <Field label="Sort order (lower shows first)">
            <input
              type="number"
              min={0}
              value={draft.sortOrder}
              onChange={(event) => setDraft((d) => ({ ...d, sortOrder: event.target.value }))}
              className={inputClass}
            />
          </Field>

          <div className="flex items-end">
            <label className="flex min-h-10 items-center gap-2 text-bhor-small text-bhor-text">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(event) => setDraft((d) => ({ ...d, active: event.target.checked }))}
                className="h-4 w-4 accent-bhor-primary"
              />
              Offered to customers
            </label>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={busy || !valid}
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button-mobile font-bhor-bold uppercase text-white disabled:opacity-50 sm:w-auto"
            >
              <Plus className="h-4 w-4" aria-hidden />
              {editingId ? "Save changes" : "Add add-on"}
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-bhor-border px-4 py-3">
          <h2 className="text-bhor-product font-bhor-bold text-bhor-text">
            Add-ons <span className="font-bhor-regular text-bhor-text-muted">({addons.length})</span>
          </h2>
          <p className="text-bhor-caption text-bhor-text-muted">
            Switched-off add-ons are hidden from customers but keep their setup.
          </p>
        </div>

        {addons.length === 0 ? (
          <EmptyState title="No add-ons yet" hint="Create one above to offer it on the Puja Add-ons page." />
        ) : (
          <ul className="divide-y divide-bhor-border">
            {addons.map((addon) => (
              <li
                key={addon.id}
                className={`flex flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3 ${addon.active ? "" : "bg-bhor-cream/60"}`}
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-bhor-sm border border-bhor-border bg-bhor-cream">
                  {addon.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={addon.image.src} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>

                <div className="min-w-[10rem] flex-1">
                  <p className="text-bhor-small font-bhor-semibold text-bhor-text">{addon.name}</p>
                  <p className="mt-0.5 line-clamp-1 text-bhor-caption text-bhor-text-muted">
                    {addon.description || "No description"}
                  </p>
                </div>

                <div className="w-24">
                  <p className="text-bhor-badge font-bhor-bold uppercase tracking-wide text-bhor-text-muted">Price</p>
                  <p className="text-bhor-small font-bhor-semibold text-bhor-text">
                    {formatPaise(addon.pricePaise)}
                    <span className="text-bhor-caption font-bhor-regular text-bhor-text-muted"> / {addon.unit}</span>
                  </p>
                </div>

                <div className="w-32">
                  <p className="text-bhor-badge font-bhor-bold uppercase tracking-wide text-bhor-text-muted">Shows on</p>
                  <p className="text-bhor-caption text-bhor-text">
                    {PRIORITIES.find((option) => option.value === addon.priority)?.hint ?? addon.priority}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={addon.active}
                    aria-label={`Offer ${addon.name}`}
                    disabled={busy}
                    onClick={() =>
                      void run(
                        () => updateAddon(addon.id, { active: !addon.active }),
                        addon.active ? `${addon.name} switched off` : `${addon.name} is offered again`,
                        "Couldn't update that add-on.",
                      )
                    }
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${addon.active ? "bg-bhor-primary" : "bg-bhor-border"}`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${addon.active ? "left-[22px]" : "left-0.5"}`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => startEdit(addon)}
                    aria-label={`Edit ${addon.name}`}
                    className="rounded-bhor-sm border border-bhor-border p-2 text-bhor-text"
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                  </button>

                  <button
                    type="button"
                    onClick={() => setRemoving(addon)}
                    aria-label={`Delete ${addon.name}`}
                    className="rounded-bhor-sm border border-bhor-border p-2 text-bhor-error"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Safe to delete outright, unlike a product: orders snapshot an add-on's
          name, price and unit at checkout, so nothing in order history reads
          this record afterwards. */}
      <ConfirmDialog
        open={removing !== null}
        title={`Delete ${removing?.name ?? "this add-on"}?`}
        message="It will be removed from every page that offers it, and its photo deleted. Orders that already include it are unaffected — they keep their own copy of the name and price. To hide it without deleting, switch it off instead."
        confirmLabel="Delete"
        destructive
        busy={busy}
        onCancel={() => setRemoving(null)}
        onConfirm={() => {
          const target = removing;
          if (!target) return;
          setRemoving(null);
          void run(() => deleteAddon(target.id), `${target.name} deleted`, "Couldn't delete that add-on.");
        }}
      />

      <Toast message={toast.message} tone={toast.tone} onDone={dismissToast} />
    </div>
  );
}
