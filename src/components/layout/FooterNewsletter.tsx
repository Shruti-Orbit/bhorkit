"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { looksLikeEmail, subscribeToNewsletter } from "@/src/lib/api/notify.api";
import { getBestEffortLocation } from "@/src/lib/geolocation";
import { ApiClientError } from "@/src/lib/api/client";

/**
 * The footer newsletter sign-up.
 *
 * Posts to the same endpoint as the Notify Me buttons on Coming Soon cards —
 * without a product id, which is what makes it a newsletter subscription
 * rather than a launch alert. Reusing it means this form inherits the
 * validation, the two rate limits and the unique index that already protect
 * that route, instead of a second path that would have to be protected again.
 *
 * Signing up twice is a success, not an error: the person wanted to be on the
 * list and they are on the list.
 */
export function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function submit() {
    const entered = email.trim();

    if (!looksLikeEmail(entered)) {
      setError("Enter a valid email address");
      return;
    }

    setIsSending(true);
    setError("");

    try {
      // Best-effort, exactly like the support form: if the browser cannot or
      // will not say where it is, this resolves to null and the sign-up goes
      // through anyway with whatever the server can work out from the address.
      const location = await getBestEffortLocation();
      const result = await subscribeToNewsletter(entered, location);
      setMessage(result.message);
      setEmail("");
    } catch (caught) {
      setError(
        caught instanceof ApiClientError ? caught.message : "Couldn't subscribe you. Please try again.",
      );
    } finally {
      setIsSending(false);
    }
  }

  if (message) {
    return (
      <p
        role="status"
        className="flex max-w-md items-center gap-2 text-bhor-small font-bhor-semibold text-bhor-gold-light"
      >
        <Check className="h-4 w-4 shrink-0" aria-hidden />
        {message}
      </p>
    );
  }

  return (
    <div className="max-w-md">
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <label htmlFor="footer-email" className="sr-only">
          Email address
        </label>
        <input
          id="footer-email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setError("");
          }}
          aria-invalid={Boolean(error)}
          placeholder="Enter your email"
          className={`min-h-11 flex-1 rounded-bhor-sm border bg-white px-4 text-bhor-small text-bhor-text placeholder:text-bhor-text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-gold-light ${
            error ? "border-bhor-error" : "border-white/20"
          }`}
        />
        <button
          type="submit"
          disabled={isSending}
          aria-label="Subscribe to the newsletter"
          className="inline-flex min-h-11 items-center justify-center rounded-bhor-sm bg-bhor-gold-light px-4 text-bhor-primary-dark transition-transform hover:-translate-y-0.5 disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-gold-light"
        >
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </form>

      {error ? (
        <p role="alert" className="mt-2 text-bhor-caption font-bhor-medium text-bhor-gold-light">
          {error}
        </p>
      ) : null}
    </div>
  );
}
