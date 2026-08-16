"use client";

import { FormEvent, useEffect, useId, useState } from "react";
import type { ReactNode } from "react";
import { Mail, Phone, UserRound, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useShop } from "@/src/context/ShopContext";
import type { CurrentUser } from "@/src/context/ShopContext";
import { startOtp, verifyOtp } from "@/src/lib/api/auth.api";
import type { AuthMode, BackendUser } from "@/src/lib/api/auth.api";
import { isValidEmail, normalizeEmail } from "@/src/utils/auth";

const mobilePattern = /^[6-9]\d{9}$/;

export function LoginModal() {
  const titleId = useId();
  const { authEmail, authModalOpen, closeAuthModal, completeAuth, setAuthEmail } = useShop();
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStarted, setOtpStarted] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [helper, setHelper] = useState("");
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

  async function handleStartOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setHelper("");

    const email = normalizeEmail(authEmail);
    const trimmedMobile = mobile.replace(/\D/g, "");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (mode === "signup") {
      if (name.trim().length < 2) {
        setError("Please enter your full name.");
        return;
      }

      if (!mobilePattern.test(trimmedMobile)) {
        setError("Please enter a valid 10 digit Indian mobile number.");
        return;
      }
    }

    setIsLoading(true);
    try {
      const result = await startOtp({
        email,
        mode,
        ...(mode === "signup" ? { mobile: trimmedMobile, name: name.trim() } : {}),
      });
      setIdentifier(result.identifier);
      setOtpStarted(true);
      setHelper(
        result.devOtp
          ? `Development OTP: ${result.devOtp}`
          : "OTP sent to your email.",
      );
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to start OTP verification.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (otp.trim().length !== 6) {
      setError("Please enter the 6 digit OTP.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyOtp({
        email: normalizeEmail(authEmail),
        identifier,
        mobile: mode === "signup" ? mobile.replace(/\D/g, "") : undefined,
        mode,
        name: mode === "signup" ? name.trim() : undefined,
        otp: otp.trim(),
      });
      completeAuth(toCurrentUser(result.user));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "OTP verification failed.");
    } finally {
      setIsLoading(false);
    }
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
                  Login or create an account
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

            <div className="px-5 pt-5">
              <div className="grid grid-cols-2 rounded-bhor-sm bg-bhor-primary-soft p-1">
                {(["login", "signup"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setMode(item);
                      setError("");
                      setHelper("");
                      setOtpStarted(false);
                    }}
                    className={`min-h-10 rounded-bhor-sm text-bhor-small font-bhor-bold uppercase transition-colors ${
                      mode === item ? "bg-bhor-primary text-white" : "text-bhor-primary"
                    }`}
                  >
                    {item === "login" ? "Login" : "Signup"}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={otpStarted ? handleVerifyOtp : handleStartOtp} className="space-y-4 px-5 py-5">
              <p className="text-bhor-small leading-bhor-body text-bhor-text-muted">
                Login or create an account to unlock member benefits. OTP will be sent to your email.
              </p>

              {mode === "signup" && !otpStarted ? (
                <label className="block">
                  <span className="text-bhor-small font-bhor-semibold text-bhor-text">Full name</span>
                  <FieldShell>
                    <UserRound className="h-4 w-4 text-bhor-text-muted" aria-hidden />
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      type="text"
                      autoComplete="name"
                      placeholder="Enter your full name"
                      className="min-w-0 flex-1 bg-transparent text-bhor-small text-bhor-text outline-none placeholder:text-bhor-text-muted"
                    />
                  </FieldShell>
                </label>
              ) : null}

              <label className="block">
                <span className="text-bhor-small font-bhor-semibold text-bhor-text">Email address</span>
                <FieldShell>
                  <Mail className="h-4 w-4 text-bhor-text-muted" aria-hidden />
                  <input
                    value={authEmail}
                    onChange={(event) => {
                      setAuthEmail(event.target.value);
                      setError("");
                    }}
                    type="email"
                    autoComplete="email"
                    placeholder="Enter email address"
                    disabled={otpStarted}
                    className="min-w-0 flex-1 bg-transparent text-bhor-small text-bhor-text outline-none placeholder:text-bhor-text-muted disabled:opacity-70"
                  />
                </FieldShell>
              </label>

              {mode === "signup" && !otpStarted ? (
                <label className="block">
                  <span className="text-bhor-small font-bhor-semibold text-bhor-text">Mobile number</span>
                  <FieldShell>
                    <Phone className="h-4 w-4 text-bhor-text-muted" aria-hidden />
                    <input
                      value={mobile}
                      onChange={(event) => setMobile(event.target.value)}
                      type="tel"
                      autoComplete="tel"
                      placeholder="Enter mobile number"
                      className="min-w-0 flex-1 bg-transparent text-bhor-small text-bhor-text outline-none placeholder:text-bhor-text-muted"
                    />
                  </FieldShell>
                </label>
              ) : null}

              {otpStarted ? (
                <label className="block">
                  <span className="text-bhor-small font-bhor-semibold text-bhor-text">OTP</span>
                  <FieldShell>
                    <input
                      value={otp}
                      onChange={(event) => setOtp(event.target.value)}
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter 6 digit OTP"
                      className="min-w-0 flex-1 bg-transparent text-bhor-small text-bhor-text outline-none placeholder:text-bhor-text-muted"
                    />
                  </FieldShell>
                </label>
              ) : null}

              {helper ? <p className="text-bhor-small font-bhor-semibold text-bhor-success">{helper}</p> : null}
              {error ? <p className="text-bhor-small font-bhor-semibold text-bhor-primary">{error}</p> : null}

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white transition-colors hover:bg-bhor-primary-dark disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
              >
                {isLoading
                  ? "Please wait..."
                  : otpStarted
                    ? "Verify OTP"
                    : mode === "login"
                      ? "Login"
                      : "Create Account"}
              </button>
            </form>
          </motion.section>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function FieldShell({ children }: { children: ReactNode }) {
  return (
    <span className="mt-2 flex min-h-12 items-center gap-3 rounded-bhor-sm border border-bhor-border bg-bhor-cream px-3 focus-within:border-bhor-primary">
      {children}
    </span>
  );
}

function toCurrentUser(user: BackendUser): CurrentUser {
  return {
    email: user.email,
    id: user.id,
    image: user.image,
    mobile: user.mobile,
    name: user.name,
  };
}
