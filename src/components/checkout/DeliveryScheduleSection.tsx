"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Loader2 } from "lucide-react";
import { getDeliveryOptions, type DeliveryMode, type DeliveryOptions } from "@/src/lib/api/order.api";
import { DeliveryCalendar } from "@/src/components/checkout/DeliveryCalendar";

type Props = {
  mode: DeliveryMode;
  date: string;
  slotId: string;
  /** Set for a Buy Now, so the window is computed for that product rather
   *  than for whatever happens to be in the cart. */
  directProductId?: string;
  onDateChange: (date: string) => void;
  onSlotChange: (slotId: string) => void;
};

/** The chosen day, spelled out, so the customer is in no doubt which it is. */
function formatDeliveryDate(iso: string) {
  return new Date(`${iso}T00:00:00.000Z`).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
}

type LoadedOptions = {
  /** The mode+date this result was fetched for. */
  key: string;
  options: DeliveryOptions | null;
  error: string;
};

/**
 * Delivery dates and slots come from the server, which is also what validates
 * them at checkout — so the UI can never offer a window the backend would
 * reject, and slots that have already passed today simply aren't listed.
 */
export function DeliveryScheduleSection({
  mode, date, slotId, directProductId, onDateChange, onSlotChange,
}: Props) {
  const requestKey = `${mode}|${date}|${directProductId ?? ""}`;
  const [loaded, setLoaded] = useState<LoadedOptions | null>(null);

  // Loading is derived by comparing what we have against what's currently
  // being asked for, rather than being flipped on inside the effect — which
  // would set state during the effect and cost an extra render pass. It also
  // means a result for a previous date can never be shown as if it were
  // current.
  const isStale = loaded?.key !== requestKey;
  const options = isStale ? null : loaded?.options ?? null;
  const loadError = isStale ? "" : loaded?.error ?? "";

  useEffect(() => {
    let active = true;

    getDeliveryOptions(mode, date || undefined, directProductId)
      .then((result) => {
        if (!active) return;
        setLoaded({ key: requestKey, options: result, error: "" });
        // Seed the first render, and correct any date that has fallen outside
        // the window since it was picked (e.g. the page sat open overnight).
        if (!date || date < result.minDate || date > result.maxDate) {
          onDateChange(result.date);
        }
      })
      .catch(() => {
        if (!active) return;
        setLoaded({
          key: requestKey,
          options: null,
          error: "Couldn't load delivery slots. Please refresh and try again.",
        });
      });

    return () => {
      active = false;
    };
    // onDateChange is a setter whose identity changes every render; including
    // it would re-fetch forever.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, date, directProductId, requestKey]);

  // A slot that's no longer offered for the chosen date must not stay selected
  // — otherwise the customer submits a window the server will reject.
  const slotStillOffered = !options || !slotId || options.slots.some((slot) => slot.id === slotId);
  useEffect(() => {
    if (!slotStillOffered) {
      onSlotChange("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotStillOffered]);

  return (
    <section className="rounded-bhor-lg border border-bhor-border bg-bhor-surface p-5 shadow-bhor-soft">
      <h2 className="flex items-center gap-2 text-bhor-product font-bhor-bold text-bhor-text">
        <CalendarDays className="h-5 w-5 text-bhor-gold" aria-hidden />
        Delivery Date &amp; Time
      </h2>
      <p className="mt-2 text-bhor-small text-bhor-text-muted">
        Pick a day and time window. Only the dates we can deliver everything in your order are
        selectable.
      </p>

      {loadError ? (
        <p className="mt-4 rounded-bhor-sm bg-bhor-peach px-3 py-2 text-bhor-small font-bhor-semibold text-bhor-error">
          {loadError}
        </p>
      ) : !options ? (
        <p className="mt-4 flex items-center gap-2 text-bhor-small text-bhor-text-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading available slots…
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          <div>
            <span className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">
              Delivery Date
            </span>
            <div className="mt-2 sm:max-w-sm">
              <DeliveryCalendar
                minDate={options.minDate}
                maxDate={options.maxDate}
                today={options.today}
                value={date}
                onSelect={onDateChange}
              />
            </div>
            {date ? (
              <p className="mt-2 text-bhor-small text-bhor-text">
                Delivering on{" "}
                <strong className="font-bhor-bold text-bhor-primary">{formatDeliveryDate(date)}</strong>
              </p>
            ) : null}
          </div>

          <div>
            <span className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">
              Delivery Time Slot
            </span>
            {options.slots.length === 0 ? (
              <p className="mt-2 rounded-bhor-sm bg-bhor-peach px-3 py-2 text-bhor-small font-bhor-semibold text-bhor-text">
                No slots left for this date. Please choose another day.
              </p>
            ) : (
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {options.slots.map((slot) => {
                  const selected = slot.id === slotId;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => onSlotChange(slot.id)}
                      aria-pressed={selected}
                      className={`min-h-11 rounded-bhor-sm border px-3 text-bhor-small font-bhor-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary ${
                        selected
                          ? "border-bhor-primary bg-bhor-primary-soft text-bhor-primary"
                          : "border-bhor-border bg-bhor-cream text-bhor-text hover:border-bhor-primary"
                      }`}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
