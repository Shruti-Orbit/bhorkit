"use client";

import { useCallback, useEffect, useState } from "react";
import { EyeOff, Gift } from "lucide-react";
import {
  Card, ErrorState, Field, LoadingState, PageHeader, Toast, inputClass,
} from "@/src/components/admin/ui";
import { listGiftsForAdmin, updateGift, type AdminGift } from "@/src/lib/api/gift.api";
import { ApiClientError } from "@/src/lib/api/client";

type Draft = {
  label: string;
  internalTitle: string;
  internalDescription: string;
  isActive: boolean;
};

/**
 * Gift management — the only place the contents of a gift are ever shown.
 *
 * There are exactly four, fixed. They cannot be created or deleted here
 * because the checkout row is four cards wide and existing customers have
 * already earned specific ones; an admin configures the four that exist.
 *
 * The split down the middle of each card is the point of the screen. The name
 * on the left is what a customer sees and must give nothing away. Everything
 * on the right is internal and never leaves the admin API.
 */
export default function AdminGiftsPage() {
  const [gifts, setGifts] = useState<AdminGift[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  // Nothing is set before the first await, so mounting this page does not
  // synchronously set state from inside the effect below.
  const load = useCallback(async () => {
    try {
      const loaded = await listGiftsForAdmin();
      setError("");
      setGifts(loaded);
      setDrafts(
        Object.fromEntries(
          loaded.map((gift) => [
            gift.id,
            {
              label: gift.label,
              internalTitle: gift.internalTitle,
              internalDescription: gift.internalDescription,
              isActive: gift.isActive,
            },
          ]),
        ),
      );
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : "Couldn't load the gifts.");
    }
  }, []);

  // Deferred a tick, matching the other admin screens: the rule treats any
  // setState reachable from an effect body as synchronous, and a microtask
  // moves the whole load out of the render pass.
  useEffect(() => { queueMicrotask(load); }, [load]);

  function edit(giftId: string, patch: Partial<Draft>) {
    setDrafts((current) => ({ ...current, [giftId]: { ...current[giftId]!, ...patch } }));
  }

  async function save(gift: AdminGift) {
    const draft = drafts[gift.id];
    if (!draft) return;

    setSavingId(gift.id);
    setError("");
    try {
      const saved = await updateGift(gift.id, draft);
      setGifts((current) => current?.map((item) => (item.id === saved.id ? saved : item)) ?? current);
      setToast(`${saved.label} saved`);
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : "Couldn't save that gift.");
    } finally {
      setSavingId("");
    }
  }

  if (!gifts && error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!gifts) return <LoadingState label="Loading gifts…" />;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Gift Management"
        description="The four first-order gifts. Customers pick one without being told what is inside — only the name is shown to them."
      />

      {error ? <ErrorState message={error} /> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {gifts.map((gift) => {
          const draft = drafts[gift.id];
          if (!draft) return null;
          const isSaving = savingId === gift.id;

          return (
            <Card key={gift.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <Gift className="h-5 w-5 text-rose-700" aria-hidden />
                  Gift {gift.slot}
                </h2>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={draft.isActive}
                    onChange={(event) => edit(gift.id, { isActive: event.target.checked })}
                    className="h-4 w-4 accent-rose-700"
                  />
                  Offered at checkout
                </label>
              </div>

              <div className="mt-4 space-y-4">
                <Field label="Name shown to the customer">
                  <input
                    value={draft.label}
                    onChange={(event) => edit(gift.id, { label: event.target.value })}
                    maxLength={60}
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Keep this neutral. Anything you write here appears on the checkout card, so it
                    must not hint at what the gift is.
                  </p>
                </Field>

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-800">
                    <EyeOff className="h-4 w-4" aria-hidden />
                    Internal only — never shown to customers
                  </p>

                  <div className="mt-3 space-y-3">
                    <Field label="What this gift is">
                      <input
                        value={draft.internalTitle}
                        onChange={(event) => edit(gift.id, { internalTitle: event.target.value })}
                        maxLength={120}
                        placeholder="e.g. Brass diya set (small)"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Contents and packing notes">
                      <textarea
                        value={draft.internalDescription}
                        onChange={(event) => edit(gift.id, { internalDescription: event.target.value })}
                        maxLength={2000}
                        rows={4}
                        placeholder="Exactly what goes in the box, supplier, any packing instructions."
                        className={`${inputClass} resize-y`}
                      />
                    </Field>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  {gift.updatedBy ? `Last updated ${new Date(gift.updatedAt).toLocaleString()}` : "Not configured yet"}
                </p>
                <button
                  type="button"
                  onClick={() => void save(gift)}
                  disabled={isSaving}
                  className="inline-flex min-h-10 items-center justify-center rounded-lg bg-rose-700 px-5 text-sm font-semibold text-white hover:bg-rose-800 disabled:opacity-60"
                >
                  {isSaving ? "Saving…" : "Save"}
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {toast ? <Toast message={toast} onDone={() => setToast("")} /> : null}
    </div>
  );
}
