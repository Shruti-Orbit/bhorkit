"use client";

import { useEffect, useState } from "react";
import { Gift, Mail, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useShop } from "@/src/context/ShopContext";
import { isValidEmail, normalizeEmail } from "@/src/utils/auth";

const offerSessionKey = "bhorkit_signup_offer_shown";
const offerDelayMs = 180000;

export function SignupOfferPopup() {
  const pathname = usePathname();
  const { isLoggedIn, openAuthModal, setAuthEmail } = useShop();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isEligible, setIsEligible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return window.sessionStorage.getItem(offerSessionKey) === "true";
  });

  const isCheckoutFlow =
    pathname.startsWith("/checkout") || pathname.startsWith("/payment") || pathname.startsWith("/orders");

  useEffect(() => {
    if (window.sessionStorage.getItem(offerSessionKey)) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsEligible(true);
    }, offerDelayMs);

    return () => window.clearTimeout(timer);
  }, []);

  const isVisible = isEligible && !isCheckoutFlow && !isLoggedIn && !isDismissed;

  if (!isVisible) {
    return null;
  }

  function closeOffer() {
    window.sessionStorage.setItem(offerSessionKey, "true");
    setIsDismissed(true);
  }

  function continueToSignup() {
    if (email.trim().length > 0 && !isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (email.trim()) {
      setAuthEmail(normalizeEmail(email));
    }
    closeOffer();
    openAuthModal();
  }

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center px-4 py-6">
      <button type="button" aria-label="Close signup offer" onClick={closeOffer} className="absolute inset-0 bg-bhor-text/45" />
      <section className="relative z-10 w-full max-w-md overflow-hidden rounded-bhor-lg border border-bhor-border bg-bhor-surface shadow-bhor-soft">
        <div className="bg-bhor-primary px-5 py-5 text-white">
          <button
            type="button"
            aria-label="Close signup offer"
            onClick={closeOffer}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-gold-light"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
          <Gift className="h-8 w-8 text-bhor-gold-light" aria-hidden />
          <p className="mt-3 text-bhor-small font-bhor-bold uppercase tracking-wide text-bhor-gold-light">
            Create your BHORKIT account
          </p>
          <h2 className="mt-1 font-bhor-display text-bhor-h2-mobile font-bhor-semibold">
            Get 10% OFF on online payment
          </h2>
        </div>
        <div className="p-5">
          <p className="text-bhor-small leading-bhor-body text-bhor-text-muted">
            Save your details, track orders, and keep your puja essentials in one place.
          </p>
          <label className="mt-4 block">
            <span className="text-bhor-small font-bhor-semibold text-bhor-text">Email address</span>
            <span className="mt-2 flex min-h-12 items-center gap-3 rounded-bhor-sm border border-bhor-border bg-bhor-cream px-3 focus-within:border-bhor-primary">
              <Mail className="h-4 w-4 text-bhor-text-muted" aria-hidden />
              <input
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                type="email"
                placeholder="Enter your email"
                className="min-w-0 flex-1 bg-transparent text-bhor-small text-bhor-text outline-none"
              />
            </span>
          </label>
          {error ? <p className="mt-2 text-bhor-small font-bhor-semibold text-bhor-primary">{error}</p> : null}
          <button
            type="button"
            onClick={continueToSignup}
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white hover:bg-bhor-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
          >
            Create Account
          </button>
          <p className="mt-3 text-center text-bhor-caption text-bhor-text-muted">
            OTP verification is handled securely by BHORKIT.
          </p>
        </div>
      </section>
    </div>
  );
}
