import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found | BHORKIT",
  description: "The page you were looking for isn't available.",
};

/**
 * The 404 page, for every URL the app does not have a route for.
 *
 * Deliberately self-contained: it renders no header, no footer and no shop
 * providers, and it fetches nothing. A "not found" screen has to work when
 * things are going wrong — including when the API is unreachable — and
 * mounting the storefront's provider tree would make this page depend on the
 * very network call that might be failing. Instead it carries its own small
 * piece of the brand: the logo, the palette, the fonts, and a way out.
 *
 * It lives at the root of `app/` rather than inside the (shop) group so that a
 * mistyped URL anywhere — storefront, admin, or a path matching nothing at all
 * — lands here rather than on Next's default screen.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-bhor-cream px-4 py-12 sm:px-6 sm:py-16">
      <div className="w-full max-w-xl text-center">
        <Link
          href="/"
          aria-label="BHORKIT home"
          className="inline-flex focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bhor-primary"
        >
          <Image
            src="/images/logo/bhor-kit-logo.png"
            alt="BHORKIT — Begin Your Day Divine"
            width={150}
            height={78}
            priority
            className="h-auto w-28 sm:w-32"
          />
        </Link>

        {/* A diya, drawn inline rather than loaded — the point of this page is
            that it renders when other things do not, so it should not depend
            on an image request succeeding. */}
        <div className="mt-8 flex justify-center sm:mt-10" aria-hidden>
          <svg viewBox="0 0 160 120" role="img" className="h-24 w-32 sm:h-28 sm:w-40">
            <title>A lit diya</title>
            <ellipse cx="80" cy="104" rx="52" ry="7" fill="#E9DCD2" opacity="0.7" />
            <circle cx="80" cy="46" r="30" fill="#E8C878" opacity="0.25" />
            <circle cx="80" cy="46" r="20" fill="#E8C878" opacity="0.3" />
            <path
              d="M80 22c7 9 11 15 11 22a11 11 0 0 1-22 0c0-7 4-13 11-22z"
              fill="#C8922E"
            />
            <path d="M80 34c3 5 5 8 5 12a5 5 0 0 1-10 0c0-4 2-7 5-12z" fill="#FFF9F2" opacity="0.85" />
            <path d="M78 66h4v10h-4z" fill="#7F1238" />
            <path
              d="M36 76h88c0 14-19 24-44 24S36 90 36 76z"
              fill="#A9164A"
            />
            <path d="M36 76h88a6 6 0 0 0-6-6H42a6 6 0 0 0-6 6z" fill="#7F1238" />
            <circle cx="58" cy="86" r="3" fill="#E8C878" opacity="0.75" />
            <circle cx="80" cy="90" r="3" fill="#E8C878" opacity="0.75" />
            <circle cx="102" cy="86" r="3" fill="#E8C878" opacity="0.75" />
          </svg>
        </div>

        <p className="mt-6 text-bhor-caption font-bhor-bold uppercase tracking-[0.2em] text-bhor-gold sm:text-bhor-small">
          Error 404
        </p>

        <h1 className="mt-2 font-bhor-display text-bhor-h2-mobile font-bhor-bold leading-bhor-heading text-bhor-text sm:text-bhor-h2">
          Oops! This page isn&apos;t available.
        </h1>

        <p className="mx-auto mt-3 max-w-md text-bhor-small leading-bhor-body text-bhor-text-muted sm:text-bhor-body">
          The page you&apos;re looking for may have been moved or doesn&apos;t exist.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-bhor-sm bg-bhor-primary px-8 text-bhor-button-mobile font-bhor-bold uppercase tracking-wide text-white transition-colors hover:bg-bhor-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary sm:w-auto sm:text-bhor-button"
          >
            Back to Home
          </Link>
          <Link
            href="/shop"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-bhor-sm border border-bhor-border bg-bhor-surface px-8 text-bhor-button-mobile font-bhor-bold uppercase tracking-wide text-bhor-text transition-colors hover:border-bhor-primary hover:text-bhor-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary sm:w-auto sm:text-bhor-button"
          >
            Browse Kits
          </Link>
        </div>

        <p className="mt-8 text-bhor-caption text-bhor-text-muted sm:text-bhor-small">
          Looking for an order?{" "}
          <Link
            href="/track-order"
            className="font-bhor-semibold text-bhor-primary underline underline-offset-2 hover:text-bhor-primary-dark"
          >
            Track it here
          </Link>{" "}
          or{" "}
          <Link
            href="/support"
            className="font-bhor-semibold text-bhor-primary underline underline-offset-2 hover:text-bhor-primary-dark"
          >
            get in touch
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
