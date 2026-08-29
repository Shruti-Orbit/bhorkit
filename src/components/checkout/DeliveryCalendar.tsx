"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Dates are handled as plain YYYY-MM-DD strings throughout, never as Date
 *  objects in the browser's timezone — a delivery day is a day in Patna, and
 *  parsing it locally is how a date silently shifts by one. */
function ym(iso: string) {
  return iso.slice(0, 7);
}

function monthLabel(month: string) {
  const [year, mon] = month.split("-").map(Number);
  return new Date(Date.UTC(year ?? 1970, (mon ?? 1) - 1, 1)).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function shiftMonth(month: string, delta: number) {
  const [year, mon] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year ?? 1970, (mon ?? 1) - 1 + delta, 1));
  return date.toISOString().slice(0, 7);
}

/** The cells of a month grid: leading blanks so the 1st lands on its weekday,
 *  then every day of the month. Weeks start on Monday. */
function monthCells(month: string) {
  const [year, mon] = month.split("-").map(Number);
  const first = new Date(Date.UTC(year ?? 1970, (mon ?? 1) - 1, 1));
  const daysInMonth = new Date(Date.UTC(year ?? 1970, mon ?? 1, 0)).getUTCDate();
  // getUTCDay is Sunday-based; shift so Monday is 0.
  const lead = (first.getUTCDay() + 6) % 7;

  const cells: (string | null)[] = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(`${month}-${String(day).padStart(2, "0")}`);
  }
  return cells;
}

/**
 * The delivery date picker.
 *
 * Shows a real month grid rather than a native date field because the whole
 * point is that most days are NOT available: the admin sets a window per
 * product range, and a mixed basket narrows it further. A grid makes the
 * bookable days visible at a glance and the rest plainly unselectable.
 *
 * `minDate` and `maxDate` are handed down from the server, which computed them
 * from the current configuration and the categories actually in the order. This
 * component decides nothing — it only draws what it was told, and the server
 * checks the chosen date again when the order is created.
 */
export function DeliveryCalendar({
  minDate,
  maxDate,
  today,
  value,
  onSelect,
}: {
  minDate: string;
  maxDate: string;
  today: string;
  value: string;
  onSelect: (date: string) => void;
}) {
  const [month, setMonth] = useState(() => ym(value && value >= minDate ? value : minDate));

  const cells = useMemo(() => monthCells(month), [month]);
  const canGoBack = month > ym(minDate);
  const canGoForward = month < ym(maxDate);

  return (
    <div className="rounded-bhor-sm border border-bhor-border bg-bhor-cream p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setMonth(shiftMonth(month, -1))}
          disabled={!canGoBack}
          aria-label="Previous month"
          className="flex h-9 w-9 items-center justify-center rounded-bhor-sm border border-bhor-border bg-bhor-surface text-bhor-text transition-colors hover:border-bhor-primary hover:text-bhor-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
        <p aria-live="polite" className="text-bhor-small font-bhor-bold text-bhor-text">
          {monthLabel(month)}
        </p>
        <button
          type="button"
          onClick={() => setMonth(shiftMonth(month, 1))}
          disabled={!canGoForward}
          aria-label="Next month"
          className="flex h-9 w-9 items-center justify-center rounded-bhor-sm border border-bhor-border bg-bhor-surface text-bhor-text transition-colors hover:border-bhor-primary hover:text-bhor-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((day) => (
          <span
            key={day}
            className="py-1 text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted"
          >
            {day.slice(0, 1)}
            <span className="sr-only">{day.slice(1)}</span>
          </span>
        ))}

        {cells.map((iso, index) => {
          if (!iso) return <span key={`blank-${index}`} aria-hidden />;

          const available = iso >= minDate && iso <= maxDate;
          const selected = iso === value;
          const isToday = iso === today;

          return (
            <button
              key={iso}
              type="button"
              disabled={!available}
              aria-pressed={selected}
              aria-label={new Date(`${iso}T00:00:00.000Z`).toLocaleDateString("en-IN", {
                weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
              })}
              onClick={() => onSelect(iso)}
              className={`flex aspect-square min-h-9 items-center justify-center rounded-bhor-sm text-bhor-small transition-colors ${
                selected
                  ? "bg-bhor-primary font-bhor-bold text-white"
                  : available
                    ? "bg-bhor-surface font-bhor-semibold text-bhor-text hover:border hover:border-bhor-primary hover:text-bhor-primary"
                    : "cursor-not-allowed text-bhor-text-muted/40"
              } ${isToday && !selected ? "ring-1 ring-inset ring-bhor-gold" : ""}`}
            >
              {Number(iso.slice(8))}
            </button>
          );
        })}
      </div>
    </div>
  );
}
