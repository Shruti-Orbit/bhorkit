"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Promotion } from "@/src/data/promotions";
import { PreOrderFeature } from "./PreOrderFeature";

type PreOrderBannerProps = Promotion;

export function PreOrderBanner({
  eyebrow,
  title,
  description,
  ctaLabel,
  ctaHref,
  image,
  imageAlt,
  features,
}: PreOrderBannerProps) {
  return (
    <section
      aria-labelledby="festival-promotion-title"
      className="bg-bhor-cream px-4 py-6 sm:px-6 lg:px-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto grid max-w-[1512px] overflow-hidden rounded-bhor-lg bg-bhor-primary shadow-bhor-soft lg:min-h-[204px] lg:grid-cols-[31%_47%_22%]"
      >
        <div className="absolute inset-0 bg-bhor-primary-dark opacity-20" aria-hidden />

        <div className="relative z-10 min-h-[238px] px-5 pb-5 pt-5 sm:min-h-[280px] sm:px-8 lg:flex lg:min-h-0 lg:flex-col lg:justify-center lg:py-8 lg:pl-10">
          <p className="text-bhor-small font-bhor-bold uppercase tracking-wide text-bhor-gold-light">
            {eyebrow}
          </p>
          <h2
            id="festival-promotion-title"
            className="mt-2 max-w-[160px] font-bhor-display text-bhor-h3-mobile font-bhor-semibold leading-bhor-heading text-white sm:max-w-[220px] md:text-bhor-h3 lg:max-w-none"
          >
            {title}
          </h2>
          <p className="mt-2 max-w-[170px] text-bhor-body-mobile leading-bhor-body text-white/85 sm:max-w-[230px] md:text-bhor-body lg:max-w-xs">
            {description}
          </p>
          <Link
            href={ctaHref}
            className="group mt-4 inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-bhor-sm bg-bhor-gold-light px-4 text-bhor-badge font-bhor-bold uppercase text-bhor-primary-dark transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-gold-light sm:min-h-11 sm:px-5 sm:text-bhor-button-mobile md:text-bhor-button"
          >
            {ctaLabel}
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </div>

        <div className="relative z-10 hidden gap-4 border-y border-white/10 px-6 py-5 sm:grid-cols-3 sm:px-8 lg:grid lg:border-x lg:border-y-0 lg:border-white/10 lg:px-8">
          {features.map((feature, index) => (
            <motion.div
              key={`${feature.title}-${feature.description}`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.42, delay: 0.08 * index }}
              className="sm:border-r sm:border-white/10 sm:pr-4 sm:last:border-r-0 sm:last:pr-0 lg:flex lg:items-center lg:justify-center"
            >
              <PreOrderFeature {...feature} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-y-0 right-0 z-10 w-[58%] overflow-hidden lg:relative lg:w-auto"
        >
          <div className="absolute inset-y-0 -right-12 left-auto w-[165%] sm:-right-16 lg:-right-16 lg:w-[170%]">
            <Image
              src={image}
              alt={imageAlt}
              fill
              sizes="(max-width: 1023px) 100vw, 38vw"
              className="object-cover object-right opacity-70"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
