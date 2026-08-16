"use client";

import { FormEvent, useState } from "react";
import type { ReactNode } from "react";
import { Mail, Phone, UserRound } from "lucide-react";
import { useShop } from "@/src/context/ShopContext";
import type { CurrentUser } from "@/src/context/ShopContext";
import { startOtp, verifyOtp } from "@/src/lib/api/auth.api";
import type { AuthMode, BackendUser } from "@/src/lib/api/auth.api";
import { isValidEmail, normalizeEmail } from "@/src/utils/auth";

const mobilePattern = /^[6-9]\d{9}$/;

export function CheckoutAuth() {
  const { authEmail, completeAuth, currentUser, isLoggedIn, setAuthEmail } = useShop();
  const [mode, setMode] = useState<AuthMode>("signup");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStarted, setOtpStarted] = useState(false);
  const [helper, setHelper] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (isLoggedIn && currentUser) {
    return (
      <section className="rounded-bhor-lg border border-bhor-border bg-bhor-surface p-5 shadow-bhor-soft">
        <p className="text-bhor-small font-bhor-semibold text-bhor-success">
          Logged in as {currentUser.email}. Select online payment below to get 10% OFF.
        </p>
      </section>
    );
  }

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
      setHelper(result.devOtp ? `Development OTP: ${result.devOtp}` : "OTP sent to your email.");
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
    <section className="rounded-bhor-lg border border-bhor-border bg-bhor-surface p-5 shadow-bhor-soft">
      <form onSubmit={otpStarted ? handleVerifyOtp : handleStartOtp} className="space-y-4">
        <div>
          <h2 className="text-bhor-product font-bhor-bold text-bhor-text">Login or create an account</h2>
          <p className="mt-1 text-bhor-small text-bhor-text-muted">
            Login or create an account to unlock member benefits. OTP will be sent to your email.
          </p>
        </div>

        <div className="grid grid-cols-2 rounded-bhor-sm bg-bhor-primary-soft p-1">
          {(["signup", "login"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setMode(item);
                setOtpStarted(false);
                setError("");
                setHelper("");
              }}
              className={`min-h-10 rounded-bhor-sm text-bhor-small font-bhor-bold uppercase ${
                mode === item ? "bg-bhor-primary text-white" : "text-bhor-primary"
              }`}
            >
              {item === "signup" ? "Create Account" : "Login"}
            </button>
          ))}
        </div>

        {mode === "signup" && !otpStarted ? (
          <Field label="Full name" icon={<UserRound className="h-4 w-4 text-bhor-text-muted" aria-hidden />}>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter full name" className="min-w-0 flex-1 bg-transparent outline-none" />
          </Field>
        ) : null}

        <Field label="Email address" icon={<Mail className="h-4 w-4 text-bhor-text-muted" aria-hidden />}>
          <input
            value={authEmail}
            onChange={(event) => {
              setAuthEmail(event.target.value);
              setError("");
            }}
            disabled={otpStarted}
            type="email"
            placeholder="Enter email address"
            className="min-w-0 flex-1 bg-transparent outline-none disabled:opacity-70"
          />
        </Field>

        {mode === "signup" && !otpStarted ? (
          <Field label="Mobile number" icon={<Phone className="h-4 w-4 text-bhor-text-muted" aria-hidden />}>
            <input value={mobile} onChange={(event) => setMobile(event.target.value)} type="tel" placeholder="Enter mobile number" className="min-w-0 flex-1 bg-transparent outline-none" />
          </Field>
        ) : null}

        {otpStarted ? (
          <Field label="OTP" icon={null}>
            <input value={otp} onChange={(event) => setOtp(event.target.value)} inputMode="numeric" maxLength={6} placeholder="Enter 6 digit OTP" className="min-w-0 flex-1 bg-transparent outline-none" />
          </Field>
        ) : null}

        {helper ? <p className="text-bhor-small font-bhor-semibold text-bhor-success">{helper}</p> : null}
        {error ? <p className="text-bhor-small font-bhor-semibold text-bhor-primary">{error}</p> : null}

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white disabled:opacity-70"
        >
          {isLoading ? "Please wait..." : otpStarted ? "Verify OTP" : mode === "signup" ? "Create Account" : "Login"}
        </button>
      </form>
    </section>
  );
}

function Field({
  children,
  icon,
  label,
}: {
  children: ReactNode;
  icon: ReactNode;
  label: string;
}) {
  return (
    <label className="block">
      <span className="text-bhor-small font-bhor-semibold text-bhor-text">{label}</span>
      <span className="mt-2 flex min-h-12 items-center gap-3 rounded-bhor-sm border border-bhor-border bg-bhor-cream px-3 text-bhor-small text-bhor-text focus-within:border-bhor-primary">
        {icon}
        {children}
      </span>
    </label>
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
