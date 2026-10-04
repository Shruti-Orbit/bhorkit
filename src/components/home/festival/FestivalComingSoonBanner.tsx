import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gift, PackageOpen, Sparkles, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Promotion } from "@/src/data/promotions";
import type { PromotionIconName } from "@/src/components/home/pre-order/PreOrderFeature";

const ICONS: Record<PromotionIconName, LucideIcon> = { PackageOpen, Gift, Sparkles, Truck };

// Twinkling specks across the night sky. Off for people who ask for reduced motion.
const MOTION = `
@keyframes bk-twinkle { 0%, 100% { opacity: 0.9; transform: scale(1); } 50% { opacity: 0.2; transform: scale(0.5); } }
.bk-twinkle { animation: bk-twinkle 3s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .bk-twinkle { animation: none; } }
`;

const SPECKS = [
  { top: "14%", left: "8%", size: 3, delay: "0s" },
  { top: "22%", left: "46%", size: 2, delay: "-1.1s" },
  { top: "70%", left: "40%", size: 3, delay: "-2s" },
  { top: "84%", left: "14%", size: 2, delay: "-0.5s" },
  { top: "10%", left: "62%", size: 2, delay: "-1.6s" },
  { top: "52%", left: "56%", size: 2, delay: "-2.4s" },
];

/**
 * A festival that isn't open yet: a "coming soon" announcement rather than an
 * order button, with a link to what can be ordered now.
 */
export function FestivalComingSoonBanner({
  eyebrow,
  title,
  description,
  ctaLabel,
  ctaHref,
  image,
  imageAlt,
  features,
}: Promotion) {
  // "Diwali kits are almost here" → the last two words get the gold treatment.
  const words = title.split(" ");
  const lead = words.slice(0, -2).join(" ");
  const accent = words.slice(-2).join(" ");

  return (
    <section aria-labelledby="festival-coming-soon-title" className="bg-bhor-cream px-4 py-6 sm:px-6 lg:px-8">
      <style>{MOTION}</style>
      <div className="relative mx-auto max-w-[1512px] overflow-hidden rounded-[28px] bg-[radial-gradient(120%_140%_at_85%_100%,#8A1640_0%,#4A0B24_45%,#1F0611_100%)] shadow-[0_30px_60px_-30px_rgb(31_6_17/0.8)] ring-1 ring-white/10">
        {/* Warm light from the diyas, and a fine star dust */}
        <div aria-hidden className="pointer-events-none absolute -bottom-32 right-10 h-96 w-96 rounded-full bg-[#F6A93B]/25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -left-20 -top-28 h-72 w-72 rounded-full bg-bhor-primary/40 blur-3xl" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(#F7DB8F_0.8px,transparent_0.8px)] [background-size:22px_22px]"
        />
        {SPECKS.map((speck) => (
          <span
            key={`${speck.top}-${speck.left}`}
            aria-hidden
            className="bk-twinkle pointer-events-none absolute rounded-full bg-[#F7DB8F] shadow-[0_0_8px_2px_rgb(247_219_143/0.6)]"
            style={{ top: speck.top, left: speck.left, width: speck.size, height: speck.size, animationDelay: speck.delay }}
          />
        ))}

        <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10 lg:max-w-[60%] lg:py-14">
          <p className="inline-flex items-center gap-2.5 rounded-full bg-white/10 py-1 pl-1 pr-3.5 ring-1 ring-white/15 backdrop-blur">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F7DB8F] px-2.5 py-0.5 text-bhor-badge font-bhor-bold uppercase tracking-[0.12em] text-[#4A0B24]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#A9164A] opacity-80 motion-reduce:animate-none" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#A9164A]" />
              </span>
              Coming soon
            </span>
            <span className="text-bhor-caption font-bhor-bold uppercase tracking-[0.16em] text-[#F7DB8F]">{eyebrow}</span>
          </p>

          <h2
            id="festival-coming-soon-title"
            className="mt-4 max-w-xl font-bhor-display text-bhor-h2-mobile font-bhor-semibold leading-bhor-tight text-white md:text-bhor-h2"
          >
            {lead}{" "}
            <span className="bg-gradient-to-r from-[#FFE7A8] via-[#F7C35C] to-[#F09A3E] bg-clip-text text-transparent">
              {accent}
            </span>
          </h2>
          <p className="mt-3 max-w-md text-bhor-body-mobile leading-bhor-body text-white/75 md:text-bhor-body">
            {description}
          </p>

          <ul className="mt-6 flex flex-wrap gap-2.5">
            {features.map((feature) => {
              const Icon = ICONS[feature.icon];
              return (
                <li
                  key={feature.title}
                  className="flex items-center gap-2.5 rounded-2xl bg-white/[0.07] py-2 pl-2 pr-4 ring-1 ring-white/10 backdrop-blur-sm"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F7DB8F] to-[#E09B3D] text-[#4A0B24]">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-bhor-caption font-bhor-bold text-white">{feature.title}</span>
                    <span className="block text-bhor-caption text-white/60">{feature.description}</span>
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <span className="inline-flex h-11 items-center rounded-full border border-dashed border-[#F7DB8F]/50 px-5 text-bhor-small font-bhor-semibold text-[#F7DB8F]">
              Launching soon — stay tuned
            </span>
            <Link
              href={ctaHref}
              className="group inline-flex items-center gap-1.5 text-bhor-small font-bhor-bold text-white underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F7DB8F]"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
        </div>

        {/* Diyas, rangoli and lanterns. The art keeps its left half empty, so on wide
            screens it can sit behind the right of the copy. */}
        <div className="relative -mt-6 h-64 sm:h-80 lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:h-auto lg:w-[64%]">
          <Image src={image} alt={imageAlt} fill unoptimized sizes="(min-width: 1024px) 64vw, 100vw" className="object-cover object-right-bottom" />
        </div>
      </div>
    </section>
  );
}
