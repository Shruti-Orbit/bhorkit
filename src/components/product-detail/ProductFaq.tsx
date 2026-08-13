"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ProductFaq as ProductFaqItem } from "@/src/data/products";

type ProductFaqProps = {
  faqs: ProductFaqItem[];
};

export function ProductFaq({ faqs }: ProductFaqProps) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h2 className="font-bhor-display text-bhor-h2-mobile font-bhor-semibold text-bhor-text md:text-bhor-h2">
        Frequently Asked Questions
      </h2>
      <div className="mt-6 divide-y divide-bhor-border border-y border-bhor-border">
        {faqs.map((faq, index) => {
          const isOpen = index === openIndex;
          return (
            <div key={faq.question}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left text-bhor-body font-bhor-semibold text-bhor-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
              >
                {faq.question}
                <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden />
              </button>
              {isOpen ? (
                <p className="pb-4 text-bhor-small leading-bhor-body text-bhor-text-muted">
                  {faq.answer}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
