"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useShop } from "@/src/context/ShopContext";
import { acceptPolicies, completeSignup, getGoogleLoginUrl } from "@/src/lib/api/auth.api";
import { getPolicies, type Policies } from "@/src/lib/api/policy.api";
import { PolicyBlocks } from "@/src/components/policies/PolicyBlocks";
import { ApiClientError } from "@/src/lib/api/client";

const CONSENT_ERROR = "Please accept the Terms & Conditions and Bhorkit Policies to continue.";

/**
 * Sign-in, and — only when it is actually needed — acceptance.
 *
 * The two are separate steps because who you are and whether you have agreed
 * are separate questions, and only one of them applies to a returning
 * customer. Pressing "Continue with Google" goes straight to Google; the
 * server then looks the email up and either signs the person in (no terms, no
 * interruption) or sends them back here with the policies to read.
 *
 * The acceptance step is not a gate this component enforces. No account exists
 * while it is on screen, and none can be created except by the server route
 * the accept button posts to. Closing the modal, reloading, or never coming
 * back all end the same way: nothing was created.
 */
export function LoginModal() {
  const router = useRouter();
  const titleId = useId();
  const errorId = useId();
  const {
    authModalOpen,
    authRedirectTo,
    closeAuthModal,
    needsPolicyAcceptance,
    markPoliciesAccepted,
    pendingSignup,
    abandonSignup,
    completeAuth,
  } = useShop();

  const [accepted, setAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [policies, setPolicies] = useState<Policies | null>(null);

  // Either a brand-new account waiting to be created, or an existing session
  // that owes acceptance because the terms were re-versioned.
  const isTermsStep = Boolean(pendingSignup) || needsPolicyAcceptance;

  function dismiss() {
    // Walking away from a half-finished signup must actively discard it, not
    // just hide it.
    if (pendingSignup) {
      abandonSignup();
      return;
    }
    closeAuthModal();
  }

  useEffect(() => {
    if (!authModalOpen) {
      return;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authModalOpen, pendingSignup, closeAuthModal, abandonSignup]);

  // Fetched only once the terms step is actually on screen, so the ordinary
  // sign-in path never pays for content it does not show.
  useEffect(() => {
    if (!isTermsStep || policies) return;

    let isActive = true;
    getPolicies()
      .then((loaded) => {
        if (isActive) setPolicies(loaded);
      })
      .catch(() => {
        // The policies are still readable on their own page, linked beside the
        // checkbox, so a failure here does not block accepting.
      });

    return () => {
      isActive = false;
    };
  }, [isTermsStep, policies]);

  function toggleAccepted(next: boolean) {
    setAccepted(next);
    // Ticking the box answers the complaint, so the complaint goes away.
    if (next) {
      setError("");
    }
  }

  async function submit() {
    // Ordinary sign-in. No checkbox here on purpose: whether this person has
    // to agree to anything is not known until the server has seen their email,
    // and a returning customer must never be asked again.
    if (!isTermsStep) {
      setIsLoading(true);
      const loginUrl = new URL(getGoogleLoginUrl());
      loginUrl.searchParams.set("returnTo", authRedirectTo);
      window.location.href = loginUrl.toString();
      return;
    }

    if (!accepted) {
      setError(CONSENT_ERROR);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (pendingSignup) {
        // This is the call that creates the account. Nothing before it wrote a
        // user row, and it carries no acceptance flag — reaching it is the
        // acceptance.
        const result = await completeSignup();
        completeAuth({
          email: result.user.email,
          id: result.user.id,
          image: result.user.image,
          name: result.user.name,
          policiesAccepted: result.user.policiesAccepted,
        });
        router.replace(result.returnTo);
        router.refresh();
        return;
      }

      await acceptPolicies();
      markPoliciesAccepted();
      closeAuthModal();
      // Discard the cached render: the middleware and every server component on
      // that route asked about acceptance before this call, so the answer they
      // hold says "not accepted" and would bounce the customer straight back.
      router.replace(authRedirectTo);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof ApiClientError ? caught.message : "Something went wrong. Please try again.",
      );
      setIsLoading(false);
    }
  }

  const showError = Boolean(error);
  const inputClassName = showError ? "outline outline-1 outline-offset-2 outline-bhor-error" : "";

  return (
    <AnimatePresence>
      {authModalOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center px-4 py-6">
          <motion.button
            type="button"
            aria-label="Close login"
            className="absolute inset-0 bg-bhor-text/45"
            onClick={dismiss}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={`relative z-10 flex max-h-full w-full flex-col overflow-hidden rounded-bhor-lg border border-bhor-border bg-bhor-surface shadow-bhor-soft ${
              isTermsStep ? "max-w-xl" : "max-w-md"
            }`}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-bhor-border px-5 py-4">
              <div>
                <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-gold">
                  BHORKIT Account
                </p>
                <h2 id={titleId} className="mt-1 text-bhor-h3-mobile font-bhor-bold text-bhor-text">
                  {isTermsStep ? "Just one step to go" : "Continue with Google"}
                </h2>
                {pendingSignup ? (
                  <p className="mt-1 text-bhor-caption text-bhor-text-muted">
                    Creating your account for {pendingSignup.email}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                aria-label="Close login"
                onClick={dismiss}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bhor-cream text-bhor-text hover:text-bhor-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            {isTermsStep ? (
              <>
                {/* The only scrolling region. The checkbox and the buttons
                    below stay put, so the thing being agreed to can be read at
                    length without the way to agree ever leaving the screen. */}
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                  {policies ? (
                    <>
                      <PolicyBlocks blocks={policies.preamble} />
                      {policies.sections.map((section) => (
                        <section key={section.id} className="mt-6 first:mt-4">
                          <h3 className="font-bhor-display text-bhor-product font-bhor-semibold text-bhor-text">
                            {section.title}
                          </h3>
                          <PolicyBlocks blocks={section.intro} />
                          {section.subsections.map((subsection) => (
                            <div key={subsection.id} className="mt-4">
                              <h4 className="text-bhor-small font-bhor-semibold text-bhor-text">
                                {subsection.number ? `${subsection.number} ` : ""}
                                {subsection.title}
                              </h4>
                              <PolicyBlocks blocks={subsection.blocks} />
                            </div>
                          ))}
                        </section>
                      ))}
                      {policies.lastUpdated ? (
                        <p className="mt-6 text-bhor-caption text-bhor-text-muted">
                          Last updated: {policies.lastUpdated}
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-bhor-small text-bhor-text-muted">Loading our policies…</p>
                  )}
                </div>

                <div className="shrink-0 border-t border-bhor-border bg-bhor-surface px-5 py-4">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={accepted}
                      onChange={(event) => toggleAccepted(event.target.checked)}
                      aria-invalid={showError}
                      aria-describedby={showError ? errorId : undefined}
                      className={`mt-0.5 h-4 w-4 shrink-0 accent-bhor-primary ${inputClassName}`}
                    />
                    <span className="text-bhor-small leading-bhor-body text-bhor-text">
                      I accept the{" "}
                      {/* Opened in a new tab so reading at length never discards
                          this modal and the half-finished signup behind it. */}
                      <Link
                        href="/policies#terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bhor-semibold text-bhor-primary underline underline-offset-2 hover:text-bhor-primary-dark"
                      >
                        Terms &amp; Conditions
                      </Link>{" "}
                      {/* and{" "}
                      <Link
                        href="/policies"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bhor-semibold text-bhor-primary underline underline-offset-2 hover:text-bhor-primary-dark"
                      >
                        Bhorkit Policies
                      </Link> */}
                    </span>
                  </label>

                  {showError ? (
                    <p
                      id={errorId}
                      role="alert"
                      className="mt-2 flex items-start gap-1.5 text-bhor-caption font-bhor-medium text-bhor-error"
                    >
                      <AlertCircle className="mt-px h-4 w-4 shrink-0" aria-hidden />
                      {error}
                    </p>
                  ) : null}

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row-reverse">
                    {/* Enabled even while unticked, on purpose. A disabled
                        button cannot be clicked and so can never explain
                        itself; pressing this one surfaces the reason. */}
                    <button
                      type="button"
                      onClick={() => void submit()}
                      disabled={isLoading}
                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-bhor-sm bg-bhor-primary px-6 text-bhor-button-mobile font-bhor-bold uppercase text-white transition-colors hover:bg-bhor-primary-dark disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
                    >
                      {isLoading ? "Just a second…" : pendingSignup ? "Accept and create account" : "Accept and continue"}
                    </button>
                    <button
                      type="button"
                      onClick={dismiss}
                      disabled={isLoading}
                      className="inline-flex min-h-11 items-center justify-center rounded-bhor-sm border border-bhor-border px-6 text-bhor-button-mobile font-bhor-semibold text-bhor-text-muted transition-colors hover:text-bhor-primary disabled:opacity-70 sm:flex-none"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4 px-5 py-5">
                <p className="text-bhor-small leading-bhor-body text-bhor-text-muted">
                  Use your Google account to save orders, manage addresses, and keep your BHORKIT
                  experience secure.
                </p>

                <button
                  type="button"
                  onClick={() => void submit()}
                  disabled={isLoading}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-bhor-sm border border-bhor-border bg-bhor-surface px-5 text-bhor-button font-bhor-bold text-bhor-text transition-colors hover:border-bhor-primary hover:text-bhor-primary disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-base font-bhor-bold text-bhor-primary shadow-bhor-soft">
                    G
                  </span>
                  {isLoading ? "Redirecting..." : "Continue with Google"}
                </button>
              </div>
            )}
          </motion.section>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
