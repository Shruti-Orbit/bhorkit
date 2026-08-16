"use client";

import { FormEvent, useEffect, useState } from "react";
import { Mail, Phone } from "lucide-react";
import { useShop } from "@/src/context/ShopContext";
import {
  findRegisteredUser,
  isExistingMockUser,
  isValidEmail,
  isValidIndianMobile,
  maskAuthIdentifier,
  mockOtp,
  registerMockUser,
  type RegisteredUser,
} from "@/src/utils/auth";

export function CheckoutAuth() {
  const { authEmail, completeAuth, currentUser, isLoggedIn, setAuthEmail } = useShop();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupMobile, setSignupMobile] = useState("");
  const [pendingUser, setPendingUser] = useState<RegisteredUser | null>(null);
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
          Logged in as {currentUser.email || currentUser.mobile}. Select online payment below to get 10% OFF.
        </p>
      </section>
    );
  }

  function continueAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (mode === "login") {
      if (!isValidEmail(authEmail) && !isValidIndianMobile(authEmail)) {
        setError("Please enter a valid registered email or mobile number.");
        return;
      }

      const user = findRegisteredUser(authEmail);
      if (!user) {
        setError("No BHORKIT account found. Please create an account first.");
        return;
      }

      setPendingUser(user);
      setAuthEmail(user.email);
      setStep("otp");
      setOtp("");
      setResendSeconds(30);
      return;
    }

    if (signupName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!isValidEmail(signupEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isValidIndianMobile(signupMobile)) {
      setError("Please enter a valid Indian mobile number.");
      return;
    }

    if (isExistingMockUser(signupEmail) || isExistingMockUser(signupMobile)) {
      setError("This account already exists. Please login instead.");
      return;
    }

    const user = registerMockUser({ email: signupEmail, mobile: signupMobile, name: signupName });
    setPendingUser(user);
    setAuthEmail(user.email);
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

    completeAuth(pendingUser?.email ?? authEmail, mode, pendingUser ?? undefined);
  }

  return (
    <section className="rounded-bhor-lg border border-bhor-border bg-bhor-surface p-5 shadow-bhor-soft">
      {step === "email" ? (
        <form onSubmit={continueAuth} className="space-y-4">
          <div>
            <h2 className="text-bhor-product font-bhor-bold text-bhor-text">Login or create an account</h2>
            <p className="mt-1 text-bhor-small text-bhor-text-muted">
              Login or create an account to continue checkout.
            </p>
          </div>
          {mode === "login" ? (
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
                  placeholder="Enter registered email or mobile"
                  className="min-w-0 flex-1 bg-transparent text-bhor-small text-bhor-text outline-none"
                />
              </span>
            </label>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-bhor-small font-bhor-semibold text-bhor-text">Full name</span>
                <input
                  value={signupName}
                  onChange={(event) => {
                    setSignupName(event.target.value);
                    setError("");
                  }}
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  className="mt-2 min-h-12 w-full rounded-bhor-sm border border-bhor-border bg-bhor-cream px-4 text-bhor-small text-bhor-text outline-none focus:border-bhor-primary"
                />
              </label>
              <label className="block">
                <span className="text-bhor-small font-bhor-semibold text-bhor-text">Email address</span>
                <span className="mt-2 flex min-h-12 items-center gap-3 rounded-bhor-sm border border-bhor-border bg-bhor-cream px-3 focus-within:border-bhor-primary">
                  <Mail className="h-4 w-4 text-bhor-text-muted" aria-hidden />
                  <input
                    value={signupEmail}
                    onChange={(event) => {
                      setSignupEmail(event.target.value);
                      setError("");
                    }}
                    type="email"
                    placeholder="Enter email address"
                    className="min-w-0 flex-1 bg-transparent text-bhor-small text-bhor-text outline-none"
                  />
                </span>
              </label>
              <label className="block">
                <span className="text-bhor-small font-bhor-semibold text-bhor-text">Mobile number</span>
                <span className="mt-2 flex min-h-12 items-center gap-3 rounded-bhor-sm border border-bhor-border bg-bhor-cream px-3 focus-within:border-bhor-primary">
                  <Phone className="h-4 w-4 text-bhor-text-muted" aria-hidden />
                  <input
                    value={signupMobile}
                    onChange={(event) => {
                      setSignupMobile(event.target.value);
                      setError("");
                    }}
                    type="tel"
                    inputMode="numeric"
                    placeholder="Enter mobile number"
                    className="min-w-0 flex-1 bg-transparent text-bhor-small text-bhor-text outline-none"
                  />
                </span>
              </label>
            </div>
          )}
          {error ? <p className="text-bhor-small font-bhor-semibold text-bhor-primary">{error}</p> : null}
          <button type="submit" className="min-h-12 w-full rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white">
            {mode === "signup" ? "Create Account" : "Login"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signup" ? "login" : "signup");
              setError("");
            }}
            className="w-full text-center text-bhor-small font-bhor-semibold text-bhor-primary"
          >
            {mode === "signup" ? "Already have an account? Login" : "New to BHORKIT? Create account"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="space-y-4">
          <div>
            <h2 className="text-bhor-product font-bhor-bold text-bhor-text">
              Verify your email
            </h2>
            <p className="mt-1 text-bhor-small text-bhor-text-muted">
              We&apos;ve sent a 6-digit OTP to {maskAuthIdentifier(pendingUser?.email ?? authEmail)}.
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
              Change details
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
