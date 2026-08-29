"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarRange, Clock, Plus, Trash2 } from "lucide-react";
import { Card, ErrorState, Field, Toast, inputClass } from "@/src/components/admin/ui";
import {
  getDeliverySettings,
  saveDeliverySettings,
  type AdminDeliverySettings,
} from "@/src/lib/api/admin.api";
import { ApiClientError } from "@/src/lib/api/client";

type SlotDraft = { startHour: string; endHour: string };

function hourLabel(hour: number) {
  const suffix = hour >= 12 && hour < 24 ? "PM" : "AM";
  const twelve = hour % 12 === 0 ? 12 : hour % 12;
  return `${twelve} ${suffix}`;
}

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

/**
 * Delivery availability: the dates each product range can be delivered on, and
 * the time slots that apply to all of them.
 *
 * The windows are per range because they are seasonal — Ganesh kits go out
 * around Ganesh Chaturthi, Navratri kits around Navratri. The slots are shared
 * because the same van makes the same rounds whatever is in the box, so there
 * is one list rather than three that could drift apart.
 *
 * An order containing more than one range can only be delivered on a day that
 * is inside every one of their windows; the checkout works that out and offers
 * nothing else. Setting ranges that never overlap is therefore a real decision,
 * and the note below the table says so.
 */
export function DeliveryAvailability() {
  const [settings, setSettings] = useState<AdminDeliverySettings | null>(null);
  const [windows, setWindows] = useState<Record<string, { startDate: string; endDate: string }>>({});
  const [slots, setSlots] = useState<SlotDraft[]>([]);
  const [error, setError] = useState("");
  const [savingWindows, setSavingWindows] = useState(false);
  const [savingSlots, setSavingSlots] = useState(false);
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    try {
      const loaded = await getDeliverySettings();
      setError("");
      setSettings(loaded);
      setWindows(
        Object.fromEntries(
          loaded.windows.map((w) => [w.slug, { startDate: w.startDate, endDate: w.endDate }]),
        ),
      );
      setSlots(loaded.slots.map((s) => ({ startHour: String(s.startHour), endHour: String(s.endHour) })));
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : "Couldn't load delivery settings.");
    }
  }, []);

  useEffect(() => { queueMicrotask(load); }, [load]);

  function editWindow(slug: string, patch: Partial<{ startDate: string; endDate: string }>) {
    setWindows((current) => ({ ...current, [slug]: { ...current[slug]!, ...patch } }));
  }

  async function persist(
    body: Parameters<typeof saveDeliverySettings>[0],
    setBusy: (busy: boolean) => void,
    message: string,
  ) {
    setBusy(true);
    setError("");
    try {
      const saved = await saveDeliverySettings(body);
      setSettings(saved);
      setToast(message);
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : "Couldn't save delivery settings.");
    } finally {
      setBusy(false);
    }
  }

  if (!settings) {
    return error ? <ErrorState message={error} onRetry={() => void load()} /> : null;
  }

  const slotsInvalid = slots.some((slot) => Number(slot.endHour) <= Number(slot.startHour));

  return (
    <div className="space-y-5">
      {error ? <ErrorState message={error} /> : null}

      <Card className="p-4">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <CalendarRange className="h-5 w-5 text-rose-700" aria-hidden />
          Delivery periods
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          When each range can be delivered. Customers can only choose dates inside these windows.
        </p>

        <div className="mt-4 space-y-4">
          {settings.windows.map((window) => {
            const draft = windows[window.slug];
            if (!draft) return null;
            const invalid = draft.startDate > draft.endDate;
            return (
              <div
                key={window.slug}
                className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[minmax(0,1fr)_170px_170px] sm:items-end"
              >
                <p className="text-sm font-semibold text-slate-900">{window.label}</p>
                <Field label="Start date">
                  <input
                    type="date"
                    value={draft.startDate}
                    onChange={(event) => editWindow(window.slug, { startDate: event.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="End date">
                  <input
                    type="date"
                    value={draft.endDate}
                    onChange={(event) => editWindow(window.slug, { endDate: event.target.value })}
                    className={`${inputClass} ${invalid ? "border-rose-500" : ""}`}
                  />
                </Field>
                {invalid ? (
                  <p className="text-xs font-medium text-rose-700 sm:col-span-3">
                    The end date must not be before the start date.
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>

        <p className="mt-3 text-xs text-slate-500">
          An order containing more than one range can only be delivered on a day that falls inside
          every one of their periods. If two ranges never overlap, customers cannot order them
          together.
        </p>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            disabled={savingWindows || Object.values(windows).some((w) => w.startDate > w.endDate)}
            onClick={() => void persist({ windows }, setSavingWindows, "Delivery periods saved")}
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-rose-700 px-5 text-sm font-semibold text-white hover:bg-rose-800 disabled:opacity-60"
          >
            {savingWindows ? "Saving…" : "Save periods"}
          </button>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <Clock className="h-5 w-5 text-rose-700" aria-hidden />
          Delivery time slots
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Used for every range. Slots that have already started are hidden from customers booking
          for today.
        </p>

        <div className="mt-4 space-y-3">
          {slots.map((slot, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[150px_150px_minmax(0,1fr)_auto] sm:items-end"
            >
              <Field label="From">
                <select
                  value={slot.startHour}
                  onChange={(event) =>
                    setSlots((c) => c.map((s, i) => (i === index ? { ...s, startHour: event.target.value } : s)))
                  }
                  className={inputClass}
                >
                  {HOURS.map((hour) => (
                    <option key={hour} value={hour}>{hourLabel(hour)}</option>
                  ))}
                </select>
              </Field>
              <Field label="To">
                <select
                  value={slot.endHour}
                  onChange={(event) =>
                    setSlots((c) => c.map((s, i) => (i === index ? { ...s, endHour: event.target.value } : s)))
                  }
                  className={inputClass}
                >
                  {HOURS.slice(1).concat(24).map((hour) => (
                    <option key={hour} value={hour}>{hourLabel(hour)}</option>
                  ))}
                </select>
              </Field>
              <p className="text-sm text-slate-600">
                {Number(slot.endHour) > Number(slot.startHour)
                  ? `Shown as “${hourLabel(Number(slot.startHour))} - ${hourLabel(Number(slot.endHour))}”`
                  : "A slot must end after it starts."}
              </p>
              <button
                type="button"
                onClick={() => setSlots((c) => c.filter((_, i) => i !== index))}
                disabled={slots.length === 1}
                aria-label="Remove slot"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-700 disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setSlots((c) => [...c, { startHour: "9", endHour: "12" }])}
            disabled={slots.length >= 8}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:border-rose-300 hover:text-rose-700 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add slot
          </button>
          <button
            type="button"
            disabled={savingSlots || slotsInvalid}
            onClick={() =>
              void persist(
                { slots: slots.map((s) => ({ startHour: Number(s.startHour), endHour: Number(s.endHour) })) },
                setSavingSlots,
                "Delivery slots saved",
              )
            }
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-rose-700 px-5 text-sm font-semibold text-white hover:bg-rose-800 disabled:opacity-60"
          >
            {savingSlots ? "Saving…" : "Save slots"}
          </button>
        </div>
      </Card>

      {toast ? <Toast message={toast} onDone={() => setToast("")} /> : null}
    </div>
  );
}
