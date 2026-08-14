"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

export function SearchBox() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        aria-label="Search"
        onClick={() => setIsOpen(true)}
        className="flex h-11 w-11 items-center justify-center text-bhor-text transition-colors hover:text-bhor-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
      >
        <Search className="h-6 w-6" aria-hidden />
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[80] flex items-start justify-center bg-bhor-text/35 px-4 pt-24">
          <section className="w-full max-w-2xl rounded-bhor-lg border border-bhor-border bg-bhor-surface p-4 shadow-bhor-soft">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-bhor-primary" aria-hidden />
              <input
                autoFocus
                type="search"
                placeholder="Search puja kits, festivals, essentials"
                className="min-h-12 min-w-0 flex-1 bg-transparent text-bhor-body text-bhor-text outline-none placeholder:text-bhor-text-muted"
              />
              <button
                type="button"
                aria-label="Close search"
                onClick={() => setIsOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-bhor-cream text-bhor-text hover:text-bhor-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <p className="mt-3 text-bhor-small text-bhor-text-muted">
              Search suggestions will be connected to the BHORKIT catalogue.
            </p>
          </section>
        </div>
      ) : null}
    </>
  );
}
