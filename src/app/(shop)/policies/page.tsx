import type { Metadata } from "next";
import { getPolicies } from "@/src/lib/api/policy.api";
import { PolicyBlocks } from "@/src/components/policies/PolicyBlocks";
import { PolicyNav } from "@/src/components/policies/PolicyNav";

// Rendered per request rather than prerendered: the policies are editable from
// the admin panel, and an edit has to be live for customers immediately rather
// than at the next deploy.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Policies | BHORKIT",
  description:
    "Shipping & delivery, returns & refunds, privacy, terms & conditions and cancellation policies for BHORKIT.",
};


/**
 * All five policies on one page.
 *
 * One page rather than five: the policies cross-reference each other constantly
 * ("see section 1.8"), and splitting them would turn every one of those into a
 * page load. The section navigation and per-section anchors give the same
 * direct access that separate URLs would, and the footer links straight to them.
 *
 * The content comes from the API, which serves it from the database — the
 * wording is not held in this repository at all, so an admin edit is live
 * without a deploy.
 *
 * `scroll-mt-*` on every heading is what keeps a heading clear of the header
 * when a visitor arrives on an anchor. The header is not sticky today, but the
 * offset costs nothing and means anchors keep working if it ever becomes so.
 */
export default async function PoliciesPage() {
  const { title, preamble, sections, lastUpdated } = await getPolicies();

  return (
    <main className="flex flex-1 flex-col bg-bhor-cream">
      <section className="px-4 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1100px]">
          <p className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-gold">
            Legal
          </p>
          <h1 className="mt-2 font-bhor-display text-bhor-h2-mobile font-bhor-semibold text-bhor-text md:text-bhor-h2">
            {title}
          </h1>
          <div className="mt-4 max-w-[760px]">
            <PolicyBlocks blocks={preamble} />
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1100px] gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start lg:gap-10">
          <PolicyNav
            sections={sections.map((section) => ({ id: section.id, label: section.navLabel }))}
          />

          <div className="min-w-0">
            {sections.map((section) => (
              <article
                key={section.id}
                id={section.id}
                className="scroll-mt-28 border-b border-bhor-border pb-8 last:border-0 last:pb-0 [&:not(:first-child)]:pt-8"
              >
                <h2 className="font-bhor-display text-bhor-h3-mobile font-bhor-semibold text-bhor-text md:text-bhor-h3">
                  {section.title}
                </h2>

                <PolicyBlocks blocks={section.intro} />

                {section.subsections.map((subsection) => (
                  <section key={subsection.id} id={subsection.id} className="mt-6 scroll-mt-28">
                    <h3 className="text-bhor-product-mobile font-bhor-semibold leading-bhor-heading text-bhor-text md:text-bhor-product">
                      {subsection.number ? (
                        <span className="mr-2 font-bhor-bold text-bhor-primary">{subsection.number}</span>
                      ) : null}
                      {subsection.title}
                    </h3>
                    <PolicyBlocks blocks={subsection.blocks} />
                  </section>
                ))}
              </article>
            ))}

            {lastUpdated ? (
              <p className="mt-10 border-t border-bhor-border pt-6 text-bhor-caption text-bhor-text-muted">
                Last updated: {lastUpdated}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
