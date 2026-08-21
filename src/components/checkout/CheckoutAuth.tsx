"use client";

import { useState } from "react";
import { useShop } from "@/src/context/ShopContext";
import { getGoogleLoginUrl } from "@/src/lib/api/auth.api";

export function CheckoutAuth() {
  const { currentUser, isAuthReady, isLoggedIn } = useShop();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  // Avoids flashing the "Continue with Google" button in front of an
  // already-logged-in user while the initial session check is still
  // resolving.
  if (!isAuthReady) {
    return (
      <section className="h-[92px] animate-pulse rounded-bhor-lg border border-bhor-border bg-bhor-surface shadow-bhor-soft" />
    );
  }

  if (isLoggedIn && currentUser) {
    return (
      <section className="rounded-bhor-lg border border-bhor-border bg-bhor-surface p-5 shadow-bhor-soft">
        <div className="flex items-center gap-3">
          {currentUser.image && !imageFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentUser.image}
              alt={currentUser.name}
              onError={() => setImageFailed(true)}
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : null}
          <div>
            <p className="text-bhor-small font-bhor-semibold text-bhor-success">
              Logged in as {currentUser.name}
            </p>
            <p className="text-bhor-small text-bhor-text-muted">{currentUser.email}</p>
          </div>
        </div>
      </section>
    );
  }

  function continueWithGoogle() {
    setIsLoading(true);
    const loginUrl = new URL(getGoogleLoginUrl());
    loginUrl.searchParams.set("returnTo", "/checkout");
    window.location.href = loginUrl.toString();
  }

  return (
    <section className="rounded-bhor-lg border border-bhor-border bg-bhor-surface p-5 shadow-bhor-soft">
      <div className="space-y-4">
        <div>
          <h2 className="text-bhor-product font-bhor-bold text-bhor-text">Login with Google</h2>
          <p className="mt-1 text-bhor-small text-bhor-text-muted">
            Continue securely with Google to complete your BHORKIT order.
          </p>
        </div>

        <button
          type="button"
          onClick={continueWithGoogle}
          disabled={isLoading}
          className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-bhor-sm border border-bhor-border bg-bhor-surface px-5 text-bhor-button font-bhor-bold text-bhor-text transition-colors hover:border-bhor-primary hover:text-bhor-primary disabled:opacity-70"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-base font-bhor-bold text-bhor-primary shadow-bhor-soft">
            G
          </span>
          {isLoading ? "Redirecting..." : "Continue with Google"}
        </button>
      </div>
    </section>
  );
}
