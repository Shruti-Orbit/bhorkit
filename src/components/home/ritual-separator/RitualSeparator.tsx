import Image from "next/image";

export function RitualSeparator() {
  return (
    <section className="bg-bhor-cream px-4 py-6 sm:px-6 lg:px-8">
      <div className="relative mx-auto min-h-[220px] max-w-[1512px] overflow-hidden rounded-bhor-lg border border-bhor-border bg-bhor-peach shadow-bhor-soft md:min-h-[300px]">
        <Image
          src="/images/sep.png"
          alt="BHORKIT festive devotional essentials"
          fill
          sizes="(max-width: 767px) 100vw, 1512px"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-bhor-text/25" aria-hidden />
        <div className="relative z-10 flex min-h-[220px] max-w-2xl flex-col justify-center px-6 py-10 md:min-h-[300px] md:px-12">
          <h2 className="font-bhor-display text-bhor-h2-mobile font-bhor-semibold leading-bhor-heading text-white md:text-bhor-h2">
            Your Rituals. Our Little Touch of Devotion.
          </h2>
          <p className="mt-3 max-w-xl text-bhor-body-mobile font-bhor-medium leading-bhor-body text-white/90 md:text-bhor-body-large">
            Bringing purity, tradition & convenience together.
          </p>
        </div>
      </div>
    </section>
  );
}
