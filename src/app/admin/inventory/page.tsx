"use client";

import { useCallback, useEffect, useState } from "react";
import { Boxes, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  Card, ConfirmDialog, EmptyState, ErrorState, Field, LoadingState, PageHeader, Toast, inputClass,
} from "@/src/components/admin/ui";
import {
  createIngredient, deleteIngredient, listIngredients, updateIngredient,
  type AdminIngredient,
} from "@/src/lib/api/admin.api";
import { ApiClientError } from "@/src/lib/api/client";

type Draft = { name: string; unit: string; quantity: string };

const BLANK: Draft = { name: "", unit: "pcs", quantity: "0" };

/**
 * The inventory.
 *
 * One row per ingredient, defined once and reused by every kit that contains
 * it. Products point at these rows rather than repeating the name, so
 * correcting a spelling here corrects it everywhere it appears.
 *
 * Deleting is refused while a product still uses the ingredient — the server
 * says which products, and that message is shown as-is, because "remove it
 * from these three kits first" is more useful than a failure.
 */
export default function AdminInventoryPage() {
  const [ingredients, setIngredients] = useState<AdminIngredient[] | null>(null);
  const [units, setUnits] = useState<string[]>(["pcs"]);
  const [draft, setDraft] = useState<Draft>(BLANK);
  const [editingId, setEditingId] = useState("");
  const [editDraft, setEditDraft] = useState<Draft>(BLANK);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" }>({ message: "", tone: "success" });
  const [confirming, setConfirming] = useState<AdminIngredient | null>(null);

  const load = useCallback(async () => {
    try {
      const loaded = await listIngredients();
      setError("");
      setIngredients(loaded.ingredients);
      if (loaded.units.length > 0) setUnits(loaded.units);
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : "Couldn't load the inventory.");
    }
  }, []);

  useEffect(() => { queueMicrotask(load); }, [load]);

  function fail(caught: unknown, fallback: string) {
    setToast({ message: caught instanceof ApiClientError ? caught.message : fallback, tone: "error" });
  }

  async function add() {
    if (!draft.name.trim()) return;
    setBusy(true);
    try {
      const created = await createIngredient({
        name: draft.name.trim(),
        unit: draft.unit,
        quantity: Number(draft.quantity) || 0,
      });
      setIngredients((current) => [...(current ?? []), created].sort((a, b) => a.name.localeCompare(b.name)));
      setDraft(BLANK);
      setToast({ message: `${created.name} added`, tone: "success" });
    } catch (caught) {
      fail(caught, "Couldn't add that ingredient.");
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit(id: string) {
    setBusy(true);
    try {
      const saved = await updateIngredient(id, {
        name: editDraft.name.trim(),
        unit: editDraft.unit,
        quantity: Number(editDraft.quantity) || 0,
      });
      setIngredients((current) =>
        (current ?? []).map((item) => (item.id === id ? saved : item)).sort((a, b) => a.name.localeCompare(b.name)),
      );
      setEditingId("");
      setToast({ message: `${saved.name} updated`, tone: "success" });
    } catch (caught) {
      fail(caught, "Couldn't save that ingredient.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(ingredient: AdminIngredient) {
    setBusy(true);
    try {
      await deleteIngredient(ingredient.id);
      setIngredients((current) => (current ?? []).filter((item) => item.id !== ingredient.id));
      setToast({ message: `${ingredient.name} removed`, tone: "success" });
    } catch (caught) {
      // The server explains which products still use it; that is the useful part.
      fail(caught, "Couldn't remove that ingredient.");
    } finally {
      setBusy(false);
      setConfirming(null);
    }
  }

  if (!ingredients && error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!ingredients) return <LoadingState label="Loading inventory…" />;

  const duplicate = ingredients.some(
    (item) => item.name.trim().toLowerCase() === draft.name.trim().toLowerCase(),
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Inventory"
        description="Every ingredient a kit can contain. Products pick from this list, so a name only ever has to be corrected here."
      />

      <Card className="p-4">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <Boxes className="h-5 w-5 text-rose-700" aria-hidden />
          Add an ingredient
        </h2>

        <form
          onSubmit={(event) => { event.preventDefault(); if (!duplicate) void add(); }}
          className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_120px_130px_auto] sm:items-end"
        >
          <Field label="Ingredient name">
            <input
              value={draft.name}
              onChange={(event) => setDraft((d) => ({ ...d, name: event.target.value }))}
              maxLength={80}
              placeholder="Camphor"
              className={`${inputClass} ${duplicate ? "border-rose-500" : ""}`}
            />
          </Field>
          <Field label="Unit">
            <select
              value={draft.unit}
              onChange={(event) => setDraft((d) => ({ ...d, unit: event.target.value }))}
              className={inputClass}
            >
              {units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
            </select>
          </Field>
          <Field label="In stock">
            <input
              type="number"
              min={0}
              value={draft.quantity}
              onChange={(event) => setDraft((d) => ({ ...d, quantity: event.target.value }))}
              className={inputClass}
            />
          </Field>
          <button
            type="submit"
            disabled={busy || !draft.name.trim() || duplicate}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-rose-700 px-5 text-sm font-semibold text-white hover:bg-rose-800 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add
          </button>
          {duplicate ? (
            <p className="text-xs font-medium text-rose-700 sm:col-span-4">
              {draft.name.trim()} is already in the inventory.
            </p>
          ) : null}
        </form>
      </Card>

      <Card className="p-4">
        <h2 className="text-base font-semibold text-slate-900">
          Ingredients <span className="font-normal text-slate-500">({ingredients.length})</span>
        </h2>

        {ingredients.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="Nothing in the inventory yet" hint="Add your first ingredient above." />
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {ingredients.map((ingredient) => {
              const isEditing = editingId === ingredient.id;
              return (
                <li key={ingredient.id} className="py-3">
                  {isEditing ? (
                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_120px_130px_auto] sm:items-end">
                      <Field label="Name">
                        <input
                          value={editDraft.name}
                          onChange={(event) => setEditDraft((d) => ({ ...d, name: event.target.value }))}
                          maxLength={80}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Unit">
                        <select
                          value={editDraft.unit}
                          onChange={(event) => setEditDraft((d) => ({ ...d, unit: event.target.value }))}
                          className={inputClass}
                        >
                          {units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                        </select>
                      </Field>
                      <Field label="In stock">
                        <input
                          type="number"
                          min={0}
                          value={editDraft.quantity}
                          onChange={(event) => setEditDraft((d) => ({ ...d, quantity: event.target.value }))}
                          className={inputClass}
                        />
                      </Field>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => void saveEdit(ingredient.id)}
                          disabled={busy || !editDraft.name.trim()}
                          className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg bg-rose-700 px-4 text-sm font-semibold text-white hover:bg-rose-800 disabled:opacity-60"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId("")}
                          aria-label="Cancel"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700"
                        >
                          <X className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{ingredient.name}</p>
                        <p className="text-xs text-slate-500">
                          Measured in {ingredient.unit} · {ingredient.quantity} {ingredient.unit} in stock
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(ingredient.id);
                            setEditDraft({
                              name: ingredient.name,
                              unit: ingredient.unit,
                              quantity: String(ingredient.quantity),
                            });
                          }}
                          aria-label={`Edit ${ingredient.name}`}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-700"
                        >
                          <Pencil className="h-4 w-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirming(ingredient)}
                          aria-label={`Remove ${ingredient.name}`}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-700"
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
        open={Boolean(confirming)}
        title={confirming ? `Remove ${confirming.name}?` : ""}
        message="If any product still uses it, this will be refused and nothing will change."
        confirmLabel="Remove"
        destructive
        busy={busy}
        onCancel={() => setConfirming(null)}
        onConfirm={() => { if (confirming) void remove(confirming); }}
      />

      {toast.message ? (
        <Toast message={toast.message} tone={toast.tone} onDone={() => setToast({ message: "", tone: "success" })} />
      ) : null}
    </div>
  );
}
