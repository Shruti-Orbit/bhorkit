"use client";

import { useEffect, useId, useState } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useShop } from "@/src/context/ShopContext";
import { getGoogleLoginUrl } from "@/src/lib/api/auth.api";

export function LoginModal() {
  const titleId = useId();
  const { authModalOpen, authRedirectTo, closeAuthModal } = useShop();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authModalOpen) {
      return;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeAuthModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [authModalOpen, closeAuthModal]);

  function continueWithGoogle() {
    setIsLoading(true);
    const loginUrl = new URL(getGoogleLoginUrl());
    loginUrl.searchParams.set("returnTo", authRedirectTo);
    window.location.href = loginUrl.toString();
  }

  return (
    <AnimatePresence>
      {authModalOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center px-4 py-6">
          <motion.button
            type="button"
            aria-label="Close login"
            className="absolute inset-0 bg-bhor-text/45"
            onClick={closeAuthModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-bhor-lg border border-bhor-border bg-bhor-surface shadow-bhor-soft"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-bhor-border px-5 py-4">
              <div>
                <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-gold">
                  BHORKIT Account
                </p>
                <h2 id={titleId} className="mt-1 text-bhor-h3-mobile font-bhor-bold text-bhor-text">
                  Continue with Google
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close login"
                onClick={closeAuthModal}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bhor-cream text-bhor-text hover:text-bhor-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              <p className="text-bhor-small leading-bhor-body text-bhor-text-muted">
                Use your Google account to save orders, manage addresses, and keep your BHORKIT experience secure.
              </p>

              <button
                type="button"
                onClick={continueWithGoogle}
                disabled={isLoading}
                className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-bhor-sm border border-bhor-border bg-bhor-surface px-5 text-bhor-button font-bhor-bold text-bhor-text transition-colors hover:border-bhor-primary hover:text-bhor-primary disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-base font-bhor-bold text-bhor-primary shadow-bhor-soft">
                  G
                </span>
                {isLoading ? "Redirecting..." : "Continue with Google"}
              </button>
            </div>
          </motion.section>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
