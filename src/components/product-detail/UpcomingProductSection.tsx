import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import type { Promotion } from "@/src/data/promotions";

type UpcomingProductSectionProps = {
  promotion: Promotion;
};

export function UpcomingProductSection({ promotion }: UpcomingProductSectionProps) {
  return (
    <section className="bg-bhor-cream px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1512px]">
        <div className="mb-5">
          <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-gold">
            Coming Soon
          </p>
          <h2 className="font-bhor-display text-bhor-h3-mobile font-bhor-semibold leading-bhor-heading text-bhor-text md:text-bhor-h3">
            Upcoming Products
          </h2>
        </div>

        <article className="relative overflow-hidden rounded-bhor-lg border border-bhor-border bg-bhor-primary shadow-bhor-soft">
          <div className="absolute inset-0 bg-bhor-primary-dark opacity-20" aria-hidden />
          <div className="relative z-10 grid min-h-[230px] gap-5 p-5 sm:p-7 md:grid-cols-[48%_52%] lg:min-h-[270px] lg:p-9">
            <div className="flex flex-col justify-center">
              <div className="flex w-fit items-center gap-2 rounded-bhor-sm bg-bhor-gold-light px-3 py-1 text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-primary-dark">
                <CalendarDays className="h-4 w-4" aria-hidden />
                {promotion.eyebrow}
              </div>
              <h3 className="mt-4 max-w-md font-bhor-display text-bhor-h2-mobile font-bhor-semibold leading-bhor-heading text-white md:text-bhor-h2">
                {promotion.title}
              </h3>
              <p className="mt-3 max-w-md text-bhor-body-mobile leading-bhor-body text-white/85 md:text-bhor-body">
                {promotion.description}
              </p>
              <Link
                href={promotion.ctaHref}
                className="group mt-5 inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-bhor-sm bg-bhor-gold-light px-5 text-bhor-button font-bhor-bold uppercase text-bhor-primary-dark transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-gold-light"
              >
                {promotion.ctaLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            </div>

            <div className="relative min-h-[190px] md:min-h-full">
              <Image
                src={promotion.image}
                alt={promotion.imageAlt}
                fill
                sizes="(max-width: 767px) 90vw, 45vw"
                className="object-contain object-right-bottom opacity-80"
              />
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
