"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { getAnnouncement, type Announcement } from "@/src/lib/api/coupon.api";

/**
 * The promotional bar at the very top of the site.
 *
 * Everything it draws — the wording, the code, the colours, when it appears
 * and when it stops — is configured on the coupon it advertises, so a bar can
 * never promote a code that has been changed or switched off underneath it.
 *
 * The countdown is measured against the SERVER's clock. The API sends the
 * moment the promotion ends and the moment it answered, and the difference
 * between that and the browser's clock is held as an offset — so a device
 * whose date is wrong shows the right time remaining, and cannot make a live
 * promotion look expired.
 *
 * Closing it hides it for this page view only. The bar is meant to be seen on
 * every load, so nothing about the dismissal is remembered.
 */
export function AnnouncementBar() {
  // The offset is kept beside the announcement rather than in a ref: it is
  // read while rendering the countdown, and a ref read during render is both
  // flagged by the linter and genuinely unreliable under concurrent rendering.
  const [loaded, setLoaded] = useState<{ announcement: Announcement; clockOffset: number } | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const announcement = loaded?.announcement ?? null;

  useEffect(() => {
    let active = true;

    getAnnouncement()
      .then((result) => {
        if (!active || !result) return;
        setLoaded({
          announcement: result,
          // browser clock − server clock, so the countdown ignores a wrong
          // device date.
          clockOffset: Date.now() - new Date(result.serverTime).getTime(),
        });
      })
      .catch(() => {
        // A poster is not worth an error. If it cannot be fetched, the site
        // simply renders without it.
      });

    return () => { active = false; };
  }, []);

  // Ticks only while a bar is actually on screen.
  useEffect(() => {
    if (!announcement || dismissed) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [announcement, dismissed]);

  const remaining = useMemo(() => {
    if (!loaded) return null;
    const endsAt = new Date(loaded.announcement.endsAt).getTime();
    const total = endsAt - (now - loaded.clockOffset);
    if (total <= 0) return null;

    const seconds = Math.floor(total / 1000);
    return {
      days: Math.floor(seconds / 86400),
      hours: Math.floor((seconds % 86400) / 3600),
      mins: Math.floor((seconds % 3600) / 60),
      secs: seconds % 60,
    };
  }, [loaded, now]);

  // No bar once it has run out — the promotion ends without a reload.
  if (!announcement || dismissed || !remaining) return null;

  const units: [string, number][] = [
    ["DAYS", remaining.days],
    ["HOURS", remaining.hours],
    ["MINS", remaining.mins],
    ["SECS", remaining.secs],
  ];

  return (
    <aside
      aria-label="Promotional offer"
      style={{ backgroundColor: announcement.background, color: announcement.textColor }}
      className="relative w-full"
    >
      <div className="mx-auto flex max-w-[1512px] flex-col items-center gap-2 px-10 py-2.5 text-center sm:px-12 md:flex-row md:justify-center md:gap-6 md:py-3 lg:px-14">
        <div className="min-w-0">
          <p className="text-bhor-caption font-bhor-bold leading-bhor-body sm:text-bhor-small">
            {announcement.message}
          </p>
          <p className="mt-0.5 text-bhor-caption font-bhor-bold sm:text-bhor-small">
            Coupon code :{" "}
            <span style={{ color: announcement.accentColor }} className="tracking-wide">
              {announcement.code}
            </span>
          </p>
        </div>

        <div className="flex shrink-0 items-start gap-1.5 sm:gap-2.5">
          {units.map(([label, value], index) => (
            <div key={label} className="flex items-start gap-1.5 sm:gap-2.5">
              {index > 0 ? (
                <span
                  aria-hidden
                  style={{ color: announcement.accentColor }}
                  className="pt-0.5 text-bhor-small font-bhor-bold opacity-60"
                >
                  :
                </span>
              ) : null}
              <span className="flex w-9 flex-col items-center sm:w-11">
                <span
                  style={{ color: announcement.accentColor }}
                  className="text-bhor-product-mobile font-bhor-bold leading-none tabular-nums sm:text-bhor-product"
                >
                  {String(value).padStart(2, "0")}
                </span>
                <span className="mt-0.5 text-[10px] font-bhor-semibold uppercase tracking-wide opacity-70">
                  {label}
                </span>
              </span>
            </div>
          ))}
        </div>

        {/* Deliberately not a link or a button: the bar announces the offer,
            it does not navigate anywhere. A span cannot be focused or
            clicked, so nothing here misleads someone into pressing it. */}
        <span
          style={{ backgroundColor: announcement.buttonBackground, color: announcement.buttonTextColor }}
          className="hidden shrink-0 rounded-bhor-sm px-5 py-2 text-bhor-caption font-bhor-bold uppercase tracking-wide sm:inline-block"
        >
          {announcement.buttonLabel}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Close the offer bar"
        style={{ color: announcement.textColor }}
        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:right-3"
      >
        <X className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
      </button>
    </aside>
  );
}
