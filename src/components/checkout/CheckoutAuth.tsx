"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { Mail } from "lucide-react";
import { useShop } from "@/src/context/ShopContext";
import { isValidEmail, normalizeEmail } from "@/src/utils/auth";

export function CheckoutAuth() {
  const { authEmail, currentUser, isLoggedIn, setAuthEmail } = useShop();
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

  async function continueWithGoogle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const hasEmail = authEmail.trim().length > 0;
    if (hasEmail && !isValidEmail(authEmail)) {
      setError("Enter a valid email address if you want Google sign-in prefetched.");
      return;
    }

    setIsLoading(true);
    await signIn(
      "google",
      { callbackUrl: "/checkout" },
      hasEmail
        ? {
            login_hint: normalizeEmail(authEmail),
          }
        : undefined,
    );
  }

  return (
    <section className="rounded-bhor-lg border border-bhor-border bg-bhor-surface p-5 shadow-bhor-soft">
      <form onSubmit={continueWithGoogle} className="space-y-4">
        <div>
          <h2 className="text-bhor-product font-bhor-bold text-bhor-text">Continue with Google</h2>
          <p className="mt-1 text-bhor-small text-bhor-text-muted">
            Checkout uses Google SSO only. Entering an email here simply helps us prefill Google&apos;s account chooser.
          </p>
        </div>
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
              className="min-w-0 flex-1 bg-transparent text-bhor-small text-bhor-text outline-none"
            />
          </span>
        </label>
        {error ? <p className="text-bhor-small font-bhor-semibold text-bhor-primary">{error}</p> : null}
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white disabled:opacity-70"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-sm font-bhor-bold text-white">
            G
          </span>
          {isLoading ? "Redirecting..." : "Continue with Google"}
        </button>
      </form>
    </section>
  );
}
