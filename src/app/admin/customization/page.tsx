"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, PackagePlus, Pencil, Plus, SlidersHorizontal, Trash2, X } from "lucide-react";
import {
  Card, ConfirmDialog, EmptyState, ErrorState, Field, LoadingState, PageHeader, Toast, inputClass,
} from "@/src/components/admin/ui";
import {
  addCustomizationItem, getCustomization, removeCustomizationItem, saveCustomizationSettings,
  updateCustomizationItem, type AdminCustomization, type AdminCustomizationItem,
} from "@/src/lib/api/admin.api";
import { ApiClientError } from "@/src/lib/api/client";
import { formatPaise } from "@/src/utils/money";

const MAX_MIN_ITEMS = 60;
const MIN_PRICE_PAISE = 100;
const MAX_PRICE_PAISE = 10_000_000;
const MAX_PACK = 100_000;

type SettingsDraft = { enabled: boolean; minItems: string; codEnabled: boolean };
type ItemDraft = { packAmount: string; packUnit: string; price: string };
type AddDraft = ItemDraft & { ingredientId: string };

const BLANK_ADD: AddDraft = { ingredientId: "", packAmount: "", packUnit: "g", price: "" };

/** Rupees typed into a form, as whole paise. NaN when it isn't a number. */
function toPaise(value: string) {
  const rupees = Number(value);
  return value.trim() && Number.isFinite(rupees) ? Math.round(rupees * 100) : NaN;
}

function packValid(value: string) {
  const amount = Number(value);
  return (
    value.trim() !== "" &&
    Number.isFinite(amount) &&
    amount > 0 &&
    amount <= MAX_PACK &&
    Math.abs(amount * 1000 - Math.round(amount * 1000)) < 1e-6
  );
}

function priceValid(paise: number) {
  return Number.isInteger(paise) && paise >= MIN_PRICE_PAISE && paise <= MAX_PRICE_PAISE;
}

function settingsDraftFrom(view: AdminCustomization): SettingsDraft {
  return { enabled: view.enabled, minItems: String(view.minItems), codEnabled: view.codEnabled };
}

/**
 * Customization: what the Customize Order page offers.
 *
 * Items are picked from the inventory — nothing is created here — and each gets
 * the pack a customer receives and its price. Stock stays in the inventory: an
 * item at zero shows as out of stock to customers. Prices set here are never
 * shown to customers; they only ever see the total of their box.
 */
export default function AdminCustomizationPage() {
  const [view, setView] = useState<AdminCustomization | null>(null);
  const [units, setUnits] = useState<string[]>(["g"]);
  const [loadError, setLoadError] = useState("");
  const [settings, setSettings] = useState<SettingsDraft>({ enabled: true, minItems: "10", codEnabled: false });
  const [addDraft, setAddDraft] = useState<AddDraft>(BLANK_ADD);
  const [editingId, setEditingId] = useState("");
  const [editDraft, setEditDraft] = useState<ItemDraft>({ packAmount: "", packUnit: "g", price: "" });
  const [removing, setRemoving] = useState<AdminCustomizationItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" }>({ message: "", tone: "success" });

  const load = useCallback(async () => {
    try {
      const loaded = await getCustomization();
      setLoadError("");
      setView(loaded.customization);
      setSettings(settingsDraftFrom(loaded.customization));
      if (loaded.units.length > 0) setUnits(loaded.units);
    } catch (caught) {
      setLoadError(caught instanceof ApiClientError ? caught.message : "Couldn't load customization.");
    }
  }, []);

  useEffect(() => { queueMicrotask(load); }, [load]);

  const dismissToast = useCallback(() => setToast({ message: "", tone: "success" }), []);

  async function run(action: () => Promise<AdminCustomization>, success: string, fallback: string) {
    setBusy(true);
    try {
      const next = await action();
      setView(next);
      setToast({ message: success, tone: "success" });
      return true;
    } catch (caught) {
      setToast({ message: caught instanceof ApiClientError ? caught.message : fallback, tone: "error" });
      return false;
    } finally {
      setBusy(false);
    }
  }

  if (!view) {
    return loadError ? <ErrorState message={loadError} onRetry={() => void load()} /> : <LoadingState label="Loading customization…" />;
  }

  // --- settings ---
  const minItems = Number(settings.minItems);
  const minItemsValid = Number.isInteger(minItems) && minItems >= 1 && minItems <= MAX_MIN_ITEMS;
  const settingsChanged =
    settings.enabled !== view.enabled || minItems !== view.minItems || settings.codEnabled !== view.codEnabled;

  async function saveSettings() {
    const ok = await run(
      () => saveCustomizationSettings({ enabled: settings.enabled, minItems, codEnabled: settings.codEnabled }),
      "Customization settings saved",
      "Couldn't save the settings.",
    );
    if (ok) setSettings({ enabled: settings.enabled, minItems: String(minItems), codEnabled: settings.codEnabled });
  }

  // --- add ---
  const picked = view.available.find((item) => item.id === addDraft.ingredientId);
  const addPrice = toPaise(addDraft.price);
  const addValid = Boolean(picked) && packValid(addDraft.packAmount) && priceValid(addPrice);

  async function addItem() {
    if (!addValid) return;
    const ok = await run(
      () => addCustomizationItem({
        ingredientId: addDraft.ingredientId,
        packAmount: Number(addDraft.packAmount),
        packUnit: addDraft.packUnit,
        pricePaise: addPrice,
        active: true,
      }),
      `${picked?.name ?? "Item"} added`,
      "Couldn't add that item.",
    );
    if (ok) setAddDraft(BLANK_ADD);
  }

  // --- edit ---
  const editPrice = toPaise(editDraft.price);
  const editValid = packValid(editDraft.packAmount) && priceValid(editPrice);

  async function saveEdit(item: AdminCustomizationItem) {
    if (!editValid) return;
    const ok = await run(
      () => updateCustomizationItem(item.ingredientId, {
        packAmount: Number(editDraft.packAmount),
        packUnit: editDraft.packUnit,
        pricePaise: editPrice,
      }),
      `${item.name ?? "Item"} updated`,
      "Couldn't save that item.",
    );
    if (ok) setEditingId("");
  }

  const activeItems = view.items.filter((item) => item.active && item.name !== null);
  const pickable = activeItems.filter((item) => (item.stock ?? 0) > 0).length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Customization"
        description="Choose which inventory items customers can put in a custom puja box, what each pack holds and what it costs. Customers never see item prices — only their box total."
        action={
          <Link
            href="/customize"
            target="_blank"
            className="inline-flex min-h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-bhor-sm border border-bhor-primary px-4 text-bhor-button-mobile font-bhor-bold uppercase text-bhor-primary"
          >
            View page
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Offered items" value={`${activeItems.length}`} hint={`${view.items.length} set up in total`} />
        <Stat label="In stock now" value={`${pickable}`} hint="Items customers can pick" />
        <Stat label="Minimum per box" value={`${view.minItems}`} hint="Different items" />
      </div>

      {view.enabled && pickable < view.minItems ? (
        <p className="flex items-start gap-2 rounded-bhor-sm border border-bhor-error bg-bhor-peach px-4 py-3 text-bhor-small font-bhor-semibold text-bhor-error">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Customers can&apos;t complete a box: only {pickable} item{pickable === 1 ? " is" : "s are"} available, but a box
          needs {view.minItems}. Offer more items, restock them in Inventory, or lower the minimum.
        </p>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <Card className="p-4">
          <h2 className="flex items-center gap-2 text-bhor-product font-bhor-bold text-bhor-text">
            <SlidersHorizontal className="h-5 w-5 text-bhor-primary" aria-hidden />
            Settings
          </h2>

          <label className="mt-4 flex items-start gap-3 text-bhor-small text-bhor-text">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(event) => setSettings((draft) => ({ ...draft, enabled: event.target.checked }))}
              className="mt-0.5 h-4 w-4 accent-bhor-primary"
            />
            <span>
              <span className="font-bhor-semibold">Accept custom orders</span>
              <span className="block text-bhor-caption text-bhor-text-muted">
                When off, the Customize Order page says custom orders are paused.
              </span>
            </span>
          </label>

          <div className="mt-4 max-w-xs">
            <Field label="Minimum different items per box">
              <input
                type="number"
                min={1}
                max={MAX_MIN_ITEMS}
                step={1}
                value={settings.minItems}
                onChange={(event) => setSettings((draft) => ({ ...draft, minItems: event.target.value }))}
                className={`${inputClass} ${minItemsValid ? "" : "border-bhor-error"}`}
              />
            </Field>
            {!minItemsValid ? (
              <p className="mt-1 text-bhor-caption font-bhor-semibold text-bhor-error">Enter a whole number from 1 to {MAX_MIN_ITEMS}.</p>
            ) : null}
          </div>

          <label className="mt-4 flex items-start gap-3 text-bhor-small text-bhor-text">
            <input
              type="checkbox"
              checked={settings.codEnabled}
              onChange={(event) => setSettings((draft) => ({ ...draft, codEnabled: event.target.checked }))}
              className="mt-0.5 h-4 w-4 accent-bhor-primary"
            />
            <span>
              <span className="font-bhor-semibold">Allow pay on delivery for custom boxes</span>
              <span className="block text-bhor-caption text-bhor-text-muted">
                The store-wide rules still apply — on/off, fee and order limit are set in{" "}
                <Link href="/admin/cod" className="font-bhor-semibold text-bhor-primary underline">Cash on Delivery</Link>.
              </span>
            </span>
          </label>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-bhor-border pt-4">
            <p className="text-bhor-caption text-bhor-text-muted">
              {view.updatedAt ? `Last updated ${new Date(view.updatedAt).toLocaleString()}` : "Using default settings"}
            </p>
            <button
              type="button"
              onClick={() => void saveSettings()}
              disabled={busy || !settingsChanged || !minItemsValid}
              className="inline-flex min-h-10 items-center justify-center rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button-mobile font-bhor-bold uppercase text-white disabled:opacity-50"
            >
              Save settings
            </button>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="flex items-center gap-2 text-bhor-product font-bhor-bold text-bhor-text">
            <PackagePlus className="h-5 w-5 text-bhor-primary" aria-hidden />
            Offer an inventory item
          </h2>
          <p className="mt-1 text-bhor-caption text-bhor-text-muted">
            Items come from the{" "}
            <Link href="/admin/inventory" className="font-bhor-semibold text-bhor-primary underline">Inventory</Link>.
            Can&apos;t find one? Add it there first, then pick it here.
          </p>

          {view.available.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title={view.items.length > 0 ? "Every inventory item is already offered" : "The inventory is empty"}
                hint="Add items in Inventory to offer them here."
              />
            </div>
          ) : (
            <form
              onSubmit={(event) => { event.preventDefault(); void addItem(); }}
              className="mt-4 grid gap-3 sm:grid-cols-2"
            >
              <div className="sm:col-span-2">
                <Field label="Inventory item">
                  <select
                    value={addDraft.ingredientId}
                    onChange={(event) => {
                      const next = view.available.find((item) => item.id === event.target.value);
                      setAddDraft((draft) => ({
                        ...draft,
                        ingredientId: event.target.value,
                        // Starts in the unit the inventory measures it in.
                        packUnit: next?.unit ?? draft.packUnit,
                      }));
                    }}
                    className={inputClass}
                  >
                    <option value="">Choose an item…</option>
                    {view.available.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} — {item.stock > 0 ? `${item.stock} ${item.unit} in stock` : "out of stock"}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <PackFields draft={addDraft} units={units} onChange={(patch) => setAddDraft((draft) => ({ ...draft, ...patch }))} />
              <Field label="Price per pack (₹)">
                <input
                  type="number"
                  min={1}
                  step="0.01"
                  inputMode="decimal"
                  value={addDraft.price}
                  onChange={(event) => setAddDraft((draft) => ({ ...draft, price: event.target.value }))}
                  placeholder="e.g. 25"
                  className={inputClass}
                />
              </Field>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={busy || !addValid}
                  className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button-mobile font-bhor-bold uppercase text-white disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  Add item
                </button>
              </div>
              {addDraft.price && !priceValid(addPrice) ? (
                <p className="text-bhor-caption font-bhor-semibold text-bhor-error sm:col-span-2">
                  Enter a price from ₹1 to ₹1,00,000 (up to 2 decimals).
                </p>
              ) : null}
            </form>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-bhor-border px-4 py-3">
          <h2 className="text-bhor-product font-bhor-bold text-bhor-text">
            Offered items <span className="font-bhor-regular text-bhor-text-muted">({view.items.length})</span>
          </h2>
          <p className="text-bhor-caption text-bhor-text-muted">Paused items are hidden from customers but keep their setup.</p>
        </div>

        {view.items.length === 0 ? (
          <EmptyState title="No items offered yet" hint="Pick items from the inventory above to build the Customize Order page." />
        ) : (
          <ul className="divide-y divide-bhor-border">
            {view.items.map((item) => {
              const missing = item.name === null;
              const outOfStock = !missing && (item.stock ?? 0) <= 0;
              const isEditing = editingId === item.ingredientId;

              return (
                <li key={item.ingredientId} className={`px-4 py-3 ${item.active ? "" : "bg-bhor-cream/60"}`}>
                  {isEditing ? (
                    <form
                      onSubmit={(event) => { event.preventDefault(); void saveEdit(item); }}
                      className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_repeat(3,minmax(0,140px))_auto] sm:items-end"
                    >
                      <p className="self-center text-bhor-small font-bhor-semibold text-bhor-text">{item.name}</p>
                      <PackFields draft={editDraft} units={units} onChange={(patch) => setEditDraft((draft) => ({ ...draft, ...patch }))} />
                      <Field label="Price (₹)">
                        <input
                          type="number"
                          min={1}
                          step="0.01"
                          inputMode="decimal"
                          value={editDraft.price}
                          onChange={(event) => setEditDraft((draft) => ({ ...draft, price: event.target.value }))}
                          className={`${inputClass} ${editDraft.price && !priceValid(editPrice) ? "border-bhor-error" : ""}`}
                        />
                      </Field>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={busy || !editValid}
                          className="inline-flex min-h-10 flex-1 items-center justify-center rounded-bhor-sm bg-bhor-primary px-4 text-bhor-button-mobile font-bhor-bold uppercase text-white disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId("")}
                          aria-label="Cancel"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-bhor-sm border border-bhor-border text-bhor-text-muted"
                        >
                          <X className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                      <div className="min-w-[12rem] flex-1">
                        <p className={`text-bhor-small font-bhor-semibold ${missing ? "text-bhor-error" : "text-bhor-text"}`}>
                          {missing ? "Removed from inventory" : item.name}
                        </p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-2 text-bhor-caption text-bhor-text-muted">
                          {missing ? (
                            "Customers no longer see this. Remove it here."
                          ) : outOfStock ? (
                            <span className="rounded-bhor-sm bg-bhor-peach px-1.5 py-0.5 font-bhor-bold uppercase text-bhor-error">
                              Out of stock
                            </span>
                          ) : (
                            <span>{item.stock} {item.stockUnit} in stock</span>
                          )}
                        </p>
                      </div>

                      <div className="w-24">
                        <p className="text-bhor-badge font-bhor-bold uppercase tracking-wide text-bhor-text-muted">Pack</p>
                        <p className="text-bhor-small font-bhor-semibold text-bhor-text">{item.packLabel}</p>
                      </div>
                      <div className="w-24">
                        <p className="text-bhor-badge font-bhor-bold uppercase tracking-wide text-bhor-text-muted">Price</p>
                        <p className="text-bhor-small font-bhor-semibold text-bhor-text">{formatPaise(item.pricePaise)}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {!missing ? (
                          <button
                            type="button"
                            role="switch"
                            aria-checked={item.active}
                            aria-label={`Offer ${item.name}`}
                            disabled={busy}
                            onClick={() =>
                              void run(
                                () => updateCustomizationItem(item.ingredientId, { active: !item.active }),
                                item.active ? `${item.name} paused` : `${item.name} is offered again`,
                                "Couldn't update that item.",
                              )
                            }
                            className={`min-h-9 whitespace-nowrap rounded-bhor-sm px-3 text-bhor-badge font-bhor-bold uppercase disabled:opacity-50 ${
                              item.active
                                ? "bg-bhor-primary-soft text-bhor-primary"
                                : "border border-bhor-border bg-bhor-surface text-bhor-text-muted"
                            }`}
                          >
                            {item.active ? "Offered" : "Paused"}
                          </button>
                        ) : null}
                        {!missing ? (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(item.ingredientId);
                              setEditDraft({
                                packAmount: String(item.packAmount),
                                packUnit: item.packUnit,
                                price: String(item.pricePaise / 100),
                              });
                            }}
                            aria-label={`Edit ${item.name}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-bhor-sm border border-bhor-border text-bhor-text-muted hover:border-bhor-primary hover:text-bhor-primary"
                          >
                            <Pencil className="h-4 w-4" aria-hidden />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => setRemoving(item)}
                          aria-label={`Remove ${item.name ?? "item"}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-bhor-sm border border-bhor-border text-bhor-text-muted hover:border-bhor-error hover:text-bhor-error"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(removing)}
        title={`Stop offering ${removing?.name ?? "this item"}?`}
        message="Customers won't be able to pick it any more. It stays in the inventory, and orders already placed are not affected."
        confirmLabel="Remove"
        destructive
        busy={busy}
        onCancel={() => setRemoving(null)}
        onConfirm={() => {
          const target = removing;
          if (!target) return;
          void run(
            () => removeCustomizationItem(target.ingredientId),
            `${target.name ?? "Item"} removed from customization`,
            "Couldn't remove that item.",
          ).then(() => setRemoving(null));
        }}
      />

      <Toast message={toast.message} tone={toast.tone} onDone={dismissToast} />
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card className="px-4 py-3">
      <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">{label}</p>
      <p className="mt-1 font-bhor-display text-bhor-h3-mobile font-bhor-semibold text-bhor-text">{value}</p>
      <p className="text-bhor-caption text-bhor-text-muted">{hint}</p>
    </Card>
  );
}

/** Pack size: an amount and its unit — "5 g", "1 kg", "2 pcs". */
function PackFields({
  draft, units, onChange,
}: { draft: ItemDraft; units: string[]; onChange: (patch: Partial<ItemDraft>) => void }) {
  const invalid = draft.packAmount !== "" && !packValid(draft.packAmount);
  return (
    <>
      <Field label="Pack size">
        <input
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          value={draft.packAmount}
          onChange={(event) => onChange({ packAmount: event.target.value })}
          placeholder="e.g. 5"
          className={`${inputClass} ${invalid ? "border-bhor-error" : ""}`}
        />
      </Field>
      <Field label="Unit">
        <select value={draft.packUnit} onChange={(event) => onChange({ packUnit: event.target.value })} className={inputClass}>
          {units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
        </select>
      </Field>
    </>
  );
}
