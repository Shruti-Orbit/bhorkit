"use client";

import { FormEvent, useEffect, useId, useState } from "react";
import { signIn } from "next-auth/react";
import { Mail, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useShop } from "@/src/context/ShopContext";
import { isValidEmail, normalizeEmail } from "@/src/utils/auth";

export function LoginModal() {
  const titleId = useId();
  const { authEmail, authModalOpen, closeAuthModal, setAuthEmail } = useShop();
  const [error, setError] = useState("");
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

  async function handleGoogleSignIn(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setError("");

    const hasEmail = authEmail.trim().length > 0;
    if (hasEmail && !isValidEmail(authEmail)) {
      setError("Enter a valid email address if you want us to prefill Google sign-in.");
      return;
    }

    setIsLoading(true);
    await signIn(
      "google",
      { callbackUrl: "/account" },
      hasEmail
        ? {
            login_hint: normalizeEmail(authEmail),
          }
        : undefined,
    );
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
                  Secure Google Sign-In
                </p>
                <h2 id={titleId} className="mt-1 font-bhor-display text-bhor-h3-mobile font-bhor-semibold text-bhor-text">
                  Continue to your BHORKIT account
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

            <form onSubmit={handleGoogleSignIn} className="space-y-4 px-5 py-5">
              <p className="text-bhor-small leading-bhor-body text-bhor-text-muted">
                We only support Google SSO. If you enter an email below, we will pass that email to Google as a sign-in hint.
              </p>
              <label className="block">
                <span className="text-bhor-small font-bhor-semibold text-bhor-text">Email address</span>
                <span className="mt-2 flex min-h-12 items-center gap-3 rounded-bhor-sm border border-bhor-border bg-bhor-cream px-3 focus-within:border-bhor-primary">
                  <Mail className="h-4 w-4 text-bhor-text-muted" aria-hidden />
                  <input
                    value={authEmail}
                    onChange={(event) => {
                      setAuthEmail(event.target.value);
                      setError("");
                    }}
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your Google email"
                    className="min-w-0 flex-1 bg-transparent text-bhor-small text-bhor-text outline-none placeholder:text-bhor-text-muted"
                  />
                </span>
              </label>
              {error ? <p className="text-bhor-small font-bhor-semibold text-bhor-primary">{error}</p> : null}
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white transition-colors hover:bg-bhor-primary-dark disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-sm font-bhor-bold text-white">
                  G
                </span>
                {isLoading ? "Redirecting..." : "Continue with Google"}
              </button>
              <p className="text-center text-bhor-caption text-bhor-text-muted">
                No phone login, OTP, or password flow is enabled.
              </p>
            </form>
          </motion.section>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
