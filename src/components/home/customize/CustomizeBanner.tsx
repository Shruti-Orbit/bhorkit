import Link from "next/link";
import { ArrowRight, PackageOpen, Sparkles } from "lucide-react";

// Illustration only — the real list is whatever the admin offers.
const SAMPLE_ITEMS = ["Roli", "Kalawa", "Camphor", "Ghee Diya", "Agarbatti", "Supari", "Akshat", "Janeu", "Haldi"];

/** Home-page entry point to Customize Order. */
export function CustomizeBanner() {
  return (
    <section aria-labelledby="customize-banner-title" className="bg-bhor-cream px-4 py-6 sm:px-6 lg:px-8">
      <div className="relative mx-auto grid max-w-[1512px] items-center gap-6 overflow-hidden rounded-bhor-lg border border-bhor-border bg-bhor-surface p-6 shadow-bhor-soft sm:p-8 lg:grid-cols-2 lg:gap-10 lg:p-10">
        <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-bhor-peach/70" />

        <div className="relative">
          <p className="inline-flex items-center gap-2 text-bhor-small font-bhor-bold uppercase tracking-wide text-bhor-gold">
            <Sparkles className="h-4 w-4" aria-hidden />
            New · Customize Order
          </p>
          <h2
            id="customize-banner-title"
            className="mt-2 font-bhor-display text-bhor-h3-mobile font-bhor-semibold leading-bhor-heading text-bhor-text md:text-bhor-h3"
          >
            Build your own puja box
          </h2>
          <p className="mt-2 max-w-md text-bhor-body-mobile leading-bhor-body text-bhor-text-muted md:text-bhor-body">
            Choose exactly the samagri you need, for any puja. We pack it fresh and deliver it to your door.
          </p>
          <Link
            href="/customize"
            className="group mt-5 inline-flex min-h-11 items-center gap-2 rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white transition-colors hover:bg-bhor-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
          >
            Start building
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </div>

        <div aria-hidden className="relative">
          <div className="rounded-bhor-md border-2 border-dashed border-bhor-border bg-bhor-cream p-4 sm:p-5">
            <p className="flex items-center gap-2 text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">
              <PackageOpen className="h-4 w-4 text-bhor-gold" />
              Your puja box
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SAMPLE_ITEMS.map((item, index) => (
                <span
                  key={item}
                  className={`rounded-full px-3 py-1.5 text-bhor-caption font-bhor-semibold ${
                    index % 3 === 0
                      ? "bg-bhor-primary text-white"
                      : "border border-bhor-border bg-bhor-surface text-bhor-text"
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
