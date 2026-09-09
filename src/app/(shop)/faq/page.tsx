import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
import { faqs, faqAnswerText, faqClosing, type FaqInline } from "@/src/data/faqs";
import { absoluteUrl } from "@/src/lib/seo/config";

export const metadata: Metadata = {
  title: "FAQs | BHORKIT",
  description:
    "Answers to common questions about BhorKit — buying puja kits and puja samagri online in Patna, what each kit contains, delivery, pre-orders, customization and order tracking.",
  alternates: {
    canonical: "/faq",
  },
};

/**
 * The FAQ page.
 *
 * Built on native `<details>` rather than a JavaScript accordion, for three
 * reasons that all point the same way: every answer is in the HTML whether or
 * not its question is expanded — a crawler reads content it cannot click, but
 * not content that is never rendered — the disclosure works before the bundle
 * loads, and the keyboard and screen-reader behaviour is the browser's rather
 * than something to reimplement. The product page's own FAQ block stays as it
 * is; it shows a handful of questions inside a page that is already about one
 * product, where this page is the questions.
 *
 * The FAQPage structured data is generated from the same `faqs` list that the
 * markup below renders, so what Google is told and what a visitor reads cannot
 * fall out of step.
 */
export default function FaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: absoluteUrl("/faq"),
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faqAnswerText(faq.answer),
      },
    })),
  };

  return (
    <main className="flex flex-1 flex-col bg-bhor-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="px-4 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[860px]">
          <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-gold">
            Help &amp; Support
          </p>
          <h1 className="mt-2 font-bhor-display text-bhor-h2-mobile font-bhor-semibold text-bhor-text md:text-bhor-h2">
            Frequently Asked Questions
          </h1>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[860px] divide-y divide-bhor-border border-y border-bhor-border">
          {faqs.map((faq, index) => (
            <details key={faq.id} id={faq.id} className="group scroll-mt-28">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-bhor-body font-bhor-semibold text-bhor-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary [&::-webkit-details-marker]:hidden">
                <span>
                  <span className="mr-2 font-bhor-bold text-bhor-primary">
                    {index + 1}.
                  </span>
                  {faq.question}
                </span>
                <ChevronDown
                  className="h-5 w-5 shrink-0 text-bhor-text-muted transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>

              <div className="pb-5">
                {faq.answer.map((block, blockIndex) =>
                  block.kind === "lines" ? (
                    <ul key={blockIndex} className="mt-3 space-y-1.5">
                      {block.items.map((line, lineIndex) => (
                        <li
                          key={lineIndex}
                          className="text-bhor-small leading-bhor-body text-bhor-text-muted md:text-bhor-body-mobile"
                        >
                          <FaqText content={line} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p
                      key={blockIndex}
                      className="mt-3 text-bhor-small leading-bhor-body text-bhor-text-muted md:text-bhor-body-mobile"
                    >
                      <FaqText content={block.content} />
                    </p>
                  ),
                )}
              </div>
            </details>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-[860px] border-l-2 border-bhor-gold bg-bhor-surface px-5 py-5">
          <p className="font-bhor-display text-bhor-h3-mobile font-bhor-semibold leading-bhor-heading text-bhor-text md:text-bhor-h3">
            {faqClosing.statement}
          </p>
          <p className="mt-2 text-bhor-small leading-bhor-body text-bhor-text-muted md:text-bhor-body-mobile">
            {faqClosing.supporting}
          </p>
        </div>
      </section>
    </main>
  );
}

/**
 * Answer text. Every value becomes a text node — nothing here is interpreted
 * as markup, matching how the policy content is rendered. The only exception
 * is a part carrying a `href`, and those hrefs are written in the data file
 * rather than coming from anywhere a visitor can reach.
 */
function FaqText({ content }: { content: FaqInline[] }) {
  return (
    <>
      {content.map((part, index) =>
        part.href ? (
          <a
            key={index}
            href={part.href}
            target={part.href.startsWith("http") ? "_blank" : undefined}
            rel={part.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="font-bhor-semibold text-bhor-primary underline underline-offset-2 transition-colors hover:text-bhor-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhor-primary"
          >
            {part.text}
          </a>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  );
}
