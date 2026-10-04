"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** A short pause after the page loads, so the popup doesn't flash over the first paint. */
const SHOW_DELAY_MS = 1200;

/**
 * Announces Customize Order with a banner image on every page load (a refresh
 * shows it again; moving between pages does not). The artwork carries its own
 * copy, button and close mark: the whole image links to the builder, and a real
 * close button sits over the painted "×".
 *
 * Not shown on the builder itself, or anywhere in the checkout flow.
 */
export function CustomizeLaunchPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const hiddenHere =
    pathname.startsWith("/customize") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/payment") ||
    pathname.startsWith("/orders");

  // Runs once per page load: client-side navigation keeps this component
  // mounted, so only a refresh (or a new visit) brings the popup back.
  useEffect(() => {
    const timer = window.setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const visible = open && !dismissed && !hiddenHere;

  // While it is up: Escape closes it and the page behind does not scroll.
  useEffect(() => {
    if (!visible) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDismissed(true);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [visible]);

  if (!visible) return null;

  const close = () => setDismissed(true);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="New: build your own puja box"
    >
      <style>{`
        @keyframes bk-pop-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes bk-pop-in { from { opacity: 0; transform: translateY(16px) scale(0.96); } to { opacity: 1; transform: none; } }
        .bk-pop-fade { animation: bk-pop-fade 0.3s ease-out both; }
        .bk-pop-in { animation: bk-pop-in 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.2) both; }
        @media (prefers-reduced-motion: reduce) { .bk-pop-fade, .bk-pop-in { animation: none; } }
      `}</style>

      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="bk-pop-fade absolute inset-0 h-full w-full cursor-default bg-black/60 backdrop-blur-[2px]"
      />

      <div className="bk-pop-in relative w-full max-w-[760px] overflow-hidden rounded-2xl shadow-[0_30px_80px_-20px_rgb(0_0_0/0.6)] ring-1 ring-white/20">
        <Link href="/customize" onClick={close} className="relative block aspect-[3/2] w-full" aria-label="Start building your puja box">
          <Image
            src="/images/pop-up/build-ur-own-box.png"
            alt="New, just launched: build your own puja box. Pick the samagri you need, choose how many of each, and we pack it fresh and deliver."
            fill
            priority
            sizes="(min-width: 800px) 760px, 92vw"
            className="object-cover"
          />
        </Link>

        {/* Sits exactly over the "×" painted in the artwork's top-right corner. */}
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-[1.2%] top-[1.5%] flex aspect-square w-[4.9%] min-w-9 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        />
      </div>
    </div>
  );
}
