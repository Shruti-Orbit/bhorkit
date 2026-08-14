"use client";

import { FormEvent, useEffect, useState } from "react";
import { Mail, Phone } from "lucide-react";
import { useShop } from "@/src/context/ShopContext";
import {
  getAuthIdentifierType,
  isExistingMockUser,
  isValidAuthIdentifier,
  maskAuthIdentifier,
  mockOtp,
} from "@/src/utils/auth";

export function CheckoutAuth() {
  const { authEmail, completeAuth, currentUser, isLoggedIn, setAuthEmail } = useShop();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (resendSeconds <= 0) {
      return;
    }

    const timer = window.setTimeout(() => setResendSeconds((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  if (isLoggedIn && currentUser) {
    return (
      <section className="rounded-bhor-lg border border-bhor-border bg-bhor-surface p-5 shadow-bhor-soft">
        <p className="text-bhor-small font-bhor-semibold text-bhor-success">
          Logged in as {currentUser.email}. Your 10% member discount is unlocked.
        </p>
      </section>
    );
  }

  function continueWithEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!isValidAuthIdentifier(authEmail)) {
      setError("Please enter a valid email address or Indian mobile number.");
      return;
    }

    setMode(isExistingMockUser(authEmail) ? "login" : "signup");
    setStep("otp");
    setOtp("");
    setResendSeconds(30);
  }

  function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (otp !== mockOtp) {
      setError("That code doesn't look right. Please try again.");
      return;
    }

    completeAuth(authEmail, mode);
  }

  return (
    <section className="rounded-bhor-lg border border-bhor-border bg-bhor-surface p-5 shadow-bhor-soft">
      {step === "email" ? (
        <form onSubmit={continueWithEmail} className="space-y-4">
          <div>
            <h2 className="text-bhor-product font-bhor-bold text-bhor-text">Login or create an account</h2>
            <p className="mt-1 text-bhor-small text-bhor-text-muted">
              Login or create an account to unlock 10% OFF.
            </p>
          </div>
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
                placeholder="Enter email or mobile number"
                className="min-w-0 flex-1 bg-transparent text-bhor-small text-bhor-text outline-none"
              />
            </span>
          </label>
          {error ? <p className="text-bhor-small font-bhor-semibold text-bhor-primary">{error}</p> : null}
          <button type="submit" className="min-h-12 w-full rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white">
            Continue
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="space-y-4">
          <div>
            <h2 className="text-bhor-product font-bhor-bold text-bhor-text">
              {getAuthIdentifierType(authEmail) === "email" ? "Verify your email" : "Verify your mobile number"}
            </h2>
            <p className="mt-1 text-bhor-small text-bhor-text-muted">
              We&apos;ve sent a 6-digit OTP to {maskAuthIdentifier(authEmail)}.
            </p>
          </div>
          <input
            value={otp}
            onChange={(event) => {
              setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
              setError("");
            }}
            inputMode="numeric"
            placeholder="123456"
            className="min-h-12 w-full rounded-bhor-sm border border-bhor-border bg-bhor-cream px-4 text-center text-bhor-h4 font-bhor-bold tracking-wide text-bhor-text outline-none focus:border-bhor-primary"
          />
          {error ? <p className="text-bhor-small font-bhor-semibold text-bhor-primary">{error}</p> : null}
          <button type="submit" className="min-h-12 w-full rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white">
            Verify & Continue
          </button>
          <div className="flex justify-between text-bhor-caption font-bhor-semibold">
            <button type="button" disabled={resendSeconds > 0} onClick={() => setResendSeconds(30)} className="text-bhor-primary disabled:text-bhor-text-muted">
              {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : "Resend OTP"}
            </button>
            <button type="button" onClick={() => setStep("email")} className="text-bhor-primary">
              Change email
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
