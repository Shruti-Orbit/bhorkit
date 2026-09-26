import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Plus, Truck } from "lucide-react";

// Illustration only — the real list is whatever the admin offers.
const SAMPLE_ITEMS = [
  { slug: "haldi", name: "Haldi" },
  { slug: "kumkum", name: "Kumkum" },
  { slug: "akshat", name: "Akshat" },
  { slug: "mauli", name: "Kalawa" },
  { slug: "fresh-flowers", name: "Flowers" },
  { slug: "kapoor", name: "Camphor" },
  { slug: "supari", name: "Supari" },
  { slug: "diya", name: "Diya" },
  { slug: "agarbatti", name: "Agarbatti" },
];

const STEPS = ["Pick the samagri you need", "Choose how many of each", "We pack it fresh & deliver"];

/** How long one "fill the box" loop takes, and the gap between items dropping in. */
const FILL_SECONDS = 9;
const FILL_STAGGER = 0.4;

// The banner's motion: items dropping into the box, a spinning "new" stamp,
// a shine across the button and the underline drawing itself. All of it is
// switched off for people who ask for reduced motion.
const BANNER_MOTION = `
@keyframes bk-fill {
  0%, 2% { opacity: 0; transform: translateY(-14px) scale(0.7); }
  7% { opacity: 1; transform: translateY(0) scale(1.06); }
  10%, 86% { opacity: 1; transform: translateY(0) scale(1); }
  94%, 100% { opacity: 0; transform: translateY(0) scale(0.92); }
}
@keyframes bk-spin { to { transform: rotate(360deg); } }
@keyframes bk-shine { 0%, 55% { transform: translateX(-120%) skewX(-20deg); } 80%, 100% { transform: translateX(260%) skewX(-20deg); } }
@keyframes bk-draw { from { stroke-dashoffset: 320; } to { stroke-dashoffset: 0; } }
@keyframes bk-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
.bk-fill { animation: bk-fill ${FILL_SECONDS}s ease-out infinite both; }
.bk-spin { animation: bk-spin 14s linear infinite; }
.bk-shine { animation: bk-shine 3.2s ease-in-out infinite; }
.bk-draw { stroke-dasharray: 320; animation: bk-draw 1.4s 0.3s ease-out both; }
.bk-float { animation: bk-float 4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .bk-fill, .bk-spin, .bk-shine, .bk-draw, .bk-float { animation: none; }
  .bk-draw { stroke-dasharray: none; }
}
`;

/** Home-page entry point to Customize Order. */
export function CustomizeBanner() {
  return (
    <section aria-labelledby="customize-banner-title" className="bg-bhor-cream px-4 py-6 sm:px-6 lg:px-8">
      <style>{BANNER_MOTION}</style>
      <div className="relative mx-auto grid max-w-[1512px] items-center overflow-hidden rounded-2xl border border-[#ECE3D8] bg-[#FBF5EC] lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)]">
        {/* Paper texture and a warm glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(#E6D6C2_0.8px,transparent_0.8px)] [background-size:14px_14px]"
        />
        <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-bhor-primary-soft/60 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 right-1/3 h-64 w-64 rounded-full bg-bhor-gold-light/25 blur-3xl" />

        <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10 lg:py-12">
          <p className="inline-flex items-center gap-2.5 rounded-full border border-bhor-primary/15 bg-white/80 py-1 pl-1 pr-3.5 shadow-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-bhor-primary px-2.5 py-0.5 text-bhor-badge font-bhor-bold uppercase tracking-[0.12em] text-white">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bhor-gold-light opacity-90 motion-reduce:animate-none" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-bhor-gold-light" />
              </span>
              New
            </span>
            <span className="text-bhor-caption font-bhor-bold uppercase tracking-[0.12em] text-bhor-gold">
              Just launched · Customize Order
            </span>
          </p>

          <h2
            id="customize-banner-title"
            className="mt-4 font-bhor-display text-bhor-h2-mobile font-bhor-semibold leading-bhor-tight text-bhor-text md:text-bhor-h2"
          >
            Build your own{" "}
            <span className="relative inline-block whitespace-nowrap text-bhor-primary">
              puja box
              <svg
                aria-hidden
                viewBox="0 0 300 16"
                preserveAspectRatio="none"
                className="absolute -bottom-2 left-0 h-3 w-full text-bhor-gold"
              >
                <path
                  className="bk-draw"
                  d="M3 11 C 60 3, 120 3, 170 8 S 260 14, 297 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>
          <p className="mt-4 max-w-md text-bhor-body-mobile leading-bhor-body text-bhor-text-muted md:text-bhor-body">
            No more fixed kits. Choose exactly the samagri you need, for any puja — we pack it fresh and deliver it to
            your door.
          </p>

          <ul className="mt-5 space-y-2">
            {STEPS.map((step) => (
              <li key={step} className="flex items-center gap-2.5 text-bhor-small font-bhor-semibold text-bhor-text">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bhor-primary text-white">
                  <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                </span>
                {step}
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Link
              href="/customize"
              className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-lg bg-bhor-primary px-6 text-bhor-button font-bhor-bold text-white shadow-[0_12px_24px_-12px_rgb(169_22_74/0.7)] transition-colors hover:bg-bhor-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
            >
              <span aria-hidden className="bk-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent" />
              <span className="relative">Start building your box</span>
              <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
            <span className="hidden text-bhor-caption font-bhor-semibold text-bhor-text-muted sm:inline">
              Takes less than a minute
            </span>
          </div>
        </div>

        {/* The open box: samagri keeps dropping into its compartments */}
        <div className="relative z-10 flex justify-center px-6 pb-12 pt-4 sm:px-10 lg:py-10 lg:pl-4" aria-hidden>
          <div className="relative w-full max-w-[340px]">
            <div className="absolute -inset-3 rotate-2 rounded-[28px] bg-[#E9D9C3]" />
            <div className="relative rounded-[24px] bg-gradient-to-br from-[#8A1640] to-[#5E0E2B] p-3 shadow-[0_30px_60px_-25px_rgb(94_14_43/0.7)]">
              <div className="grid grid-cols-3 gap-2 rounded-[16px] bg-[#F3E6D3] p-2">
                {SAMPLE_ITEMS.map((item, index) => (
                  <span
                    key={item.slug}
                    className="relative aspect-square overflow-hidden rounded-[10px] border border-dashed border-[#D9C6AD] bg-[#EFE0CB] shadow-[inset_0_2px_6px_rgb(0_0_0/0.12)]"
                  >
                    {/* Empty compartment, seen between loops */}
                    <span className="absolute inset-0 flex items-center justify-center text-[#C9B293]">
                      <Plus className="h-5 w-5" />
                    </span>
                    <span className="bk-fill absolute inset-0" style={{ animationDelay: `${index * FILL_STAGGER}s` }}>
                      <Image src={`/images/customize/${item.slug}.webp`} alt="" fill sizes="110px" className="object-cover" />
                      <span className="absolute inset-x-1 bottom-1 truncate rounded-md bg-white/85 px-1 py-0.5 text-center text-[10px] font-bhor-bold text-bhor-text backdrop-blur-sm">
                        {item.name}
                      </span>
                    </span>
                  </span>
                ))}
              </div>
              <p className="mt-2 text-center font-bhor-display text-bhor-small font-bhor-semibold tracking-wide text-bhor-gold-light">
                BHORKIT
              </p>
            </div>

            {/* Spinning "new" stamp */}
            <div className="absolute -left-7 -top-7 h-[84px] w-[84px] sm:-left-10 sm:-top-9">
              <span className="absolute inset-0 rounded-full bg-bhor-gold-light shadow-[0_10px_24px_-10px_rgb(127_18_56/0.6)]" />
              <svg viewBox="0 0 100 100" className="bk-spin absolute inset-0 h-full w-full">
                <defs>
                  <path id="bk-stamp-circle" d="M50 50 m-36 0 a36 36 0 1 1 72 0 a36 36 0 1 1 -72 0" />
                </defs>
                <text className="fill-bhor-primary-dark text-[10px] font-bold uppercase">
                  {/* Stretched to exactly one lap of the circle (2π × 36 ≈ 226). */}
                  <textPath href="#bk-stamp-circle" textLength="224" lengthAdjust="spacing">
                    • Try it now • Just launched
                  </textPath>
                </text>
              </svg>
              <span className="absolute inset-[26px] flex items-center justify-center rounded-full bg-bhor-primary text-white">
                <Plus className="h-4 w-4" strokeWidth={3} />
              </span>
            </div>

            <div className="bk-float absolute -right-4 top-10 rounded-xl border border-[#ECE3D8] bg-white px-3 py-2 shadow-[0_12px_28px_-14px_rgb(36_26_28/0.45)] sm:-right-8">
              <p className="text-bhor-badge font-bhor-bold uppercase tracking-wide text-bhor-text-muted">Any puja</p>
              <p className="text-bhor-small font-bhor-bold text-bhor-text">Any occasion</p>
            </div>
            <div
              className="bk-float absolute -bottom-4 -left-4 flex items-center gap-2 rounded-xl border border-[#ECE3D8] bg-white px-3 py-2 shadow-[0_12px_28px_-14px_rgb(36_26_28/0.45)] sm:-left-10"
              style={{ animationDelay: "1.5s" }}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EEF4EC] text-bhor-success">
                <Truck className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-bhor-small font-bhor-bold text-bhor-text">Home delivery</span>
                <span className="block text-bhor-caption text-bhor-text-muted">Across Patna</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
