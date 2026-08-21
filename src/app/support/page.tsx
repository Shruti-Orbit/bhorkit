"use client";

import { FormEvent, useState } from "react";
import { Mail, Send } from "lucide-react";
import { useShop } from "@/src/context/ShopContext";
import { ApiClientError } from "@/src/lib/api/client";
import { submitSupportQuery } from "@/src/lib/api/support.api";
import { getBestEffortLocation } from "@/src/lib/geolocation";

const MIN_LENGTH = 5;
const MAX_LENGTH = 300;
const SUPPORT_EMAIL = "support@bhorkit.com";

export default function SupportPage() {
  return (
    <main className="flex flex-1 flex-col bg-bhor-cream px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl rounded-bhor-lg border border-bhor-border bg-bhor-surface p-8 shadow-bhor-soft">
        <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-gold">
          Help & Support
        </p>
        <h1 className="mt-2 font-bhor-display text-bhor-h2-mobile font-bhor-semibold text-bhor-text md:text-bhor-h2">
          How can we help?
        </h1>
        <p className="mt-3 text-bhor-small leading-bhor-body text-bhor-text-muted">
          Tell us what&apos;s going on with your order, delivery or pre-order, and our team will get back to you.
        </p>

        <div className="mt-6">
          <SupportContent />
        </div>
      </section>
    </main>
  );
}

function SupportContent() {
  const { isAuthReady, isLoggedIn } = useShop();

  // Avoids flashing the "log in or email us" fallback in front of an
  // already-logged-in user while the initial session check resolves.
  if (!isAuthReady) {
    return <div className="h-[168px] animate-pulse rounded-bhor-md bg-bhor-cream" />;
  }

  if (!isLoggedIn) {
    return (
      <div className="rounded-bhor-md bg-bhor-cream p-6 text-center">
        <Mail className="mx-auto h-7 w-7 text-bhor-primary" aria-hidden />
        <p className="mt-3 text-bhor-small font-bhor-semibold text-bhor-text">
          Log in to send us a query directly, or reach us at:
        </p>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="mt-2 inline-block text-bhor-product font-bhor-bold text-bhor-primary hover:text-bhor-primary-dark"
        >
          {SUPPORT_EMAIL}
        </a>
      </div>
    );
  }

  return <SupportForm />;
}

function SupportForm() {
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const trimmedLength = description.trim().length;
  const isValid = trimmedLength >= MIN_LENGTH && description.length <= MAX_LENGTH;
  const showTooShortHint = description.length > 0 && trimmedLength < MIN_LENGTH;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      // Best-effort: if location is unavailable/denied, this resolves to
      // null and the query is still submitted.
      const location = await getBestEffortLocation();
      await submitSupportQuery(description.trim(), location);
      setDescription("");
      setFeedback({ type: "success", message: "Thanks — we've received your query and will get back to you soon." });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof ApiClientError ? error.message : "Couldn't send your query. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <label className="block">
        <span className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">
          Your Query
        </span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={MAX_LENGTH}
          rows={5}
          placeholder="Tell us about your order, delivery, or any issue you're facing..."
          className={`mt-2 w-full resize-none rounded-bhor-sm border bg-bhor-cream px-3 py-2.5 text-bhor-small text-bhor-text outline-none focus:border-bhor-primary ${
            showTooShortHint ? "border-bhor-error" : "border-bhor-border"
          }`}
        />
        <div className="mt-1 flex items-center justify-between">
          <span className="text-bhor-caption text-bhor-error">
            {showTooShortHint ? `Please share a bit more detail (${MIN_LENGTH} characters minimum).` : ""}
          </span>
          <span className="shrink-0 text-bhor-caption text-bhor-text-muted">
            {description.length}/{MAX_LENGTH}
          </span>
        </div>
      </label>

      {feedback ? (
        <p
          className={`text-bhor-small font-bhor-semibold ${
            feedback.type === "success" ? "text-bhor-success" : "text-bhor-error"
          }`}
        >
          {feedback.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-bhor-sm bg-bhor-primary px-6 text-bhor-button font-bhor-bold uppercase text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send className="h-4 w-4" aria-hidden />
        {isSubmitting ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
