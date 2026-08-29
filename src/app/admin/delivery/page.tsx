"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  Card, ConfirmDialog, EmptyState, ErrorState, Field, LoadingState, PageHeader, Toast, inputClass,
} from "@/src/components/admin/ui";
import {
  addDeliveryPincode, listDeliveryPincodes, removeDeliveryPincode, type AdminDeliveryPincode,
} from "@/src/lib/api/admin.api";
import { ApiClientError } from "@/src/lib/api/client";
import { DeliveryAvailability } from "@/src/components/admin/DeliveryAvailability";

const PINCODE_PATTERN = /^[1-9]\d{5}$/;

/**
 * Delivery coverage — the pincodes BHORKIT will accept orders for.
 *
 * This is the single source of truth the address form, the product page
 * checker and checkout all read. Adding a pincode here makes it orderable
 * immediately; removing one blocks new orders on it right away while leaving
 * existing addresses and past orders untouched.
 */
export default function AdminDeliveryPage() {
  const [pincodes, setPincodes] = useState<AdminDeliveryPincode[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" }>({ message: "", tone: "success" });

  const [newPincode, setNewPincode] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<AdminDeliveryPincode | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setState("loading");
    listDeliveryPincodes()
      .then((result) => {
        setPincodes(result);
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

  // Mirrors the server's rule so the button is only offered for input the
  // server will accept. The server validates independently regardless.
  const trimmed = newPincode.replace(/[\s-]/g, "").trim();
  const isValid = PINCODE_PATTERN.test(trimmed);
  const isDuplicate = pincodes.some((entry) => entry.pincode === trimmed);

  async function add() {
    setAdding(true);
    try {
      await addDeliveryPincode(trimmed, newLabel.trim());
      setToast({ message: `${trimmed} is now serviceable.`, tone: "success" });
      setNewPincode("");
      setNewLabel("");
      load();
    } catch (error) {
      setToast({
        message: error instanceof ApiClientError ? error.message : "Couldn't add that pincode.",
        tone: "error",
      });
    } finally {
      setAdding(false);
    }
  }

  async function confirmRemove() {
    if (!removing) return;
    setBusy(true);
    try {
      await removeDeliveryPincode(removing.pincode);
      setToast({ message: `${removing.pincode} is no longer serviceable.`, tone: "success" });
      setRemoving(null);
      load();
    } catch (error) {
      setToast({
        message: error instanceof ApiClientError ? error.message : "Couldn't remove that pincode.",
        tone: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Delivery"
        description="When each range can be delivered, the time slots that apply to all of them, and the pincodes BHORKIT covers."
      />

      <DeliveryAvailability />

      <h2 className="mt-8 mb-3 text-base font-semibold text-slate-900">Delivery areas</h2>
      <p className="mb-3 text-sm text-slate-600">
        Customers can only save addresses and place orders on a pincode listed here.
      </p>

      <Card className="p-4">
        <form
          onSubmit={(event) => { event.preventDefault(); if (isValid && !isDuplicate) void add(); }}
          className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)_auto] sm:items-end"
        >
          <Field label="Pincode">
            <input
              value={newPincode}
              onChange={(event) => setNewPincode(event.target.value.replace(/[^\d]/g, "").slice(0, 6))}
              inputMode="numeric"
              placeholder="800001"
              className={inputClass}
            />
          </Field>
          <Field label="Area name (optional)">
            <input
              value={newLabel}
              onChange={(event) => setNewLabel(event.target.value)}
              placeholder="Boring Road"
              className={inputClass}
            />
          </Field>
          <button
            type="submit"
            disabled={!isValid || isDuplicate || adding}
            className="min-h-10 rounded-bhor-sm bg-bhor-primary px-4 py-2 text-bhor-button-mobile font-bhor-bold uppercase text-white disabled:opacity-50"
          >
            {adding ? "Adding…" : "Add pincode"}
          </button>
        </form>

        {newPincode.length > 0 && !isValid ? (
          <p className="mt-2 text-bhor-caption text-bhor-primary">Enter a valid 6-digit pincode.</p>
        ) : null}
        {isValid && isDuplicate ? (
          <p className="mt-2 text-bhor-caption text-bhor-primary">{trimmed} is already in the list.</p>
        ) : null}
      </Card>

      <div className="mt-5">
        <Card>
          {state === "loading" ? (
            <LoadingState label="Loading delivery areas…" />
          ) : state === "error" ? (
            <ErrorState message="Couldn't load delivery areas." onRetry={load} />
          ) : pincodes.length === 0 ? (
            <EmptyState
              title="No delivery areas"
              hint="No pincode is serviceable, so no customer can place an order. Add one above."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-bhor-small">
                <thead>
                  <tr className="border-b border-bhor-border text-left">
                    <th className="px-4 py-2 text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">Pincode</th>
                    <th className="px-4 py-2 text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">Area</th>
                    <th className="px-4 py-2 text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">Added</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {pincodes.map((entry) => (
                    <tr key={entry.pincode} className="border-b border-bhor-border last:border-0">
                      <td className="px-4 py-3 font-bhor-semibold text-bhor-text">{entry.pincode}</td>
                      <td className="px-4 py-3 text-bhor-text-muted">{entry.label || "—"}</td>
                      <td className="px-4 py-3 text-bhor-caption text-bhor-text-muted">
                        {new Date(entry.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setRemoving(entry)}
                            aria-label={`Remove ${entry.pincode}`}
                            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-bhor-sm border border-bhor-border px-3 py-1.5 text-bhor-caption font-bhor-bold uppercase text-bhor-primary"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                            Remove
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
      </div>

      <ConfirmDialog
        open={removing !== null}
        title="Remove delivery area"
        message={`Customers will no longer be able to place orders to ${removing?.pincode ?? ""}. Saved addresses on this pincode are kept and marked unavailable; orders already placed are unaffected.`}
        confirmLabel="Remove"
        busy={busy}
        onConfirm={confirmRemove}
        onCancel={() => setRemoving(null)}
      />

      <Toast message={toast.message} tone={toast.tone} onDone={() => setToast({ message: "", tone: "success" })} />
    </div>
  );
}
