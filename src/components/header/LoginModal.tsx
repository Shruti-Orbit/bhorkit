"use client";

import { FormEvent, useEffect, useId, useState } from "react";
import { Mail, Phone, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useShop } from "@/src/context/ShopContext";
import {
  getAuthIdentifierType,
  isExistingMockUser,
  isValidAuthIdentifier,
  maskAuthIdentifier,
  mockOtp,
} from "@/src/utils/auth";

export function LoginModal() {
  const titleId = useId();
  const {
    authEmail,
    authModalOpen,
    authMode,
    authStep,
    closeAuthModal,
    completeAuth,
    setAuthEmail,
    setAuthMode,
    setAuthStep,
  } = useShop();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

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

  useEffect(() => {
    if (resendSeconds <= 0) {
      return;
    }

    const timer = window.setTimeout(() => setResendSeconds((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!isValidAuthIdentifier(authEmail)) {
      setError("Please enter a valid email address or Indian mobile number.");
      return;
    }

    setIsLoading(true);
    window.setTimeout(() => {
      const nextMode = isExistingMockUser(authEmail) ? "login" : "signup";
      setAuthMode(nextMode);
      setAuthStep("otp");
      setOtp("");
      setResendSeconds(30);
      setIsLoading(false);
    }, 450);
  }

  function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (otp !== mockOtp) {
      setError("That code doesn't look right. Please try again.");
      return;
    }

    setIsLoading(true);
    window.setTimeout(() => {
      completeAuth(authEmail, authMode);
      setIsLoading(false);
      closeAuthModal();
    }, 450);
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
                  Welcome to BHORKIT
                </p>
                <h2 id={titleId} className="mt-1 font-bhor-display text-bhor-h3-mobile font-bhor-semibold text-bhor-text">
                  {authStep === "otp"
                    ? getAuthIdentifierType(authEmail) === "email"
                      ? "Verify your email"
                      : "Verify your mobile number"
                    : authMode === "signup"
                      ? "Create your account"
                      : "Login to your account"}
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

            {authStep === "otp" ? (
              <form onSubmit={verifyOtp} className="space-y-4 px-5 py-5">
                <p className="text-bhor-small leading-bhor-body text-bhor-text-muted">
                  We&apos;ve sent a 6-digit OTP to {maskAuthIdentifier(authEmail)}.
                </p>
                <label className="block">
                  <span className="text-bhor-small font-bhor-semibold text-bhor-text">OTP</span>
                  <input
                    value={otp}
                    onChange={(event) => {
                      setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                      setError("");
                    }}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    className="mt-2 min-h-12 w-full rounded-bhor-sm border border-bhor-border bg-bhor-cream px-4 text-center text-bhor-h4 font-bhor-bold tracking-wide text-bhor-text outline-none focus:border-bhor-primary"
                  />
                </label>
                {error ? <p className="text-bhor-small font-bhor-semibold text-bhor-primary">{error}</p> : null}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white hover:bg-bhor-primary-dark disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
                >
                  {isLoading ? "Verifying..." : "Verify & Continue"}
                </button>
                <div className="flex items-center justify-between gap-3 text-bhor-caption font-bhor-semibold">
                  <button
                    type="button"
                    disabled={resendSeconds > 0}
                    onClick={() => setResendSeconds(30)}
                    className="text-bhor-primary disabled:text-bhor-text-muted"
                  >
                    {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : "Resend OTP"}
                  </button>
                  <button type="button" onClick={() => setAuthStep("email")} className="text-bhor-primary">
                    Change email
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={submitEmail} className="space-y-4 px-5 py-5">
                <label className="block">
                  <span className="text-bhor-small font-bhor-semibold text-bhor-text">Email or mobile number</span>
                  <span className="mt-2 flex min-h-12 items-center gap-3 rounded-bhor-sm border border-bhor-border bg-bhor-cream px-3 focus-within:border-bhor-primary">
                    {authEmail.includes("@") ? (
                      <Mail className="h-4 w-4 text-bhor-text-muted" aria-hidden />
                    ) : (
                      <Phone className="h-4 w-4 text-bhor-text-muted" aria-hidden />
                    )}
                    <input
                      value={authEmail}
                      onChange={(event) => {
                        setAuthEmail(event.target.value);
                        setError("");
                      }}
                      type="text"
                      autoComplete="username"
                      placeholder="Enter email or mobile number"
                      className="min-w-0 flex-1 bg-transparent text-bhor-small text-bhor-text outline-none placeholder:text-bhor-text-muted"
                    />
                  </span>
                </label>
                {error ? <p className="text-bhor-small font-bhor-semibold text-bhor-primary">{error}</p> : null}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white transition-colors hover:bg-bhor-primary-dark disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
                >
                  {isLoading ? "Sending OTP..." : "Continue"}
                </button>
                <button
                  type="button"
                  className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-bhor-sm border border-bhor-border bg-bhor-surface px-5 text-bhor-button font-bhor-semibold text-bhor-text hover:border-bhor-primary hover:text-bhor-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-bhor-cream font-bhor-bold text-bhor-primary">
                    G
                  </span>
                  Continue with Google
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === "signup" ? "login" : "signup")}
                  className="w-full text-center text-bhor-small font-bhor-semibold text-bhor-primary hover:text-bhor-primary-dark"
                >
                  {authMode === "signup" ? "Already have an account? Login" : "New to BHORKIT? Create account"}
                </button>
              </form>
            )}
          </motion.section>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
