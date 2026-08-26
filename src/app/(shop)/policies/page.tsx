import type { Metadata } from "next";
import { getPolicies, type PolicyBlock, type PolicyInline } from "@/src/lib/api/policy.api";
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

function Text({ content }: { content: PolicyInline[] }) {
  return (
    <>
      {content.map((part, index) =>
        part.bold ? (
          <strong key={index} className="font-bhor-semibold text-bhor-text">
            {part.text}
          </strong>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  );
}

function Blocks({ blocks }: { blocks: PolicyBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.kind === "paragraph") {
          return (
            <p key={index} className="mt-3 text-bhor-small leading-bhor-body text-bhor-text-muted md:text-bhor-body-mobile">
              <Text content={block.content} />
            </p>
          );
        }

        if (block.kind === "bullets") {
          return (
            <ul key={index} className="mt-3 space-y-2 pl-5">
              {block.items.map((item, itemIndex) => (
                <li
                  key={itemIndex}
                  className="list-disc text-bhor-small leading-bhor-body text-bhor-text-muted marker:text-bhor-gold md:text-bhor-body-mobile"
                >
                  <Text content={item} />
                </li>
              ))}
            </ul>
          );
        }

        if (block.kind === "numbers") {
          return (
            <ol key={index} className="mt-3 space-y-2 pl-5">
              {block.items.map((item, itemIndex) => (
                <li
                  key={itemIndex}
                  className="list-decimal text-bhor-small leading-bhor-body text-bhor-text-muted marker:font-bhor-bold marker:text-bhor-gold md:text-bhor-body-mobile"
                >
                  <Text content={item} />
                </li>
              ))}
            </ol>
          );
        }

        // Tables are the one block that can be wider than a phone, so it gets
        // its own scroll container rather than pushing the page sideways.
        return (
          <div key={index} className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-left text-bhor-small">
              <thead>
                <tr>
                  {block.head.map((cell, cellIndex) => (
                    <th
                      key={cellIndex}
                      className="border-b border-bhor-border px-3 py-2 align-top text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted"
                    >
                      <Text content={cell} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-bhor-border last:border-0">
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-3 py-3 align-top leading-bhor-body text-bhor-text-muted"
                      >
                        <Text content={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </>
  );
}

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
            <Blocks blocks={preamble} />
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

                <Blocks blocks={section.intro} />

                {section.subsections.map((subsection) => (
                  <section key={subsection.id} id={subsection.id} className="mt-6 scroll-mt-28">
                    <h3 className="text-bhor-product-mobile font-bhor-semibold leading-bhor-heading text-bhor-text md:text-bhor-product">
                      {subsection.number ? (
                        <span className="mr-2 font-bhor-bold text-bhor-primary">{subsection.number}</span>
                      ) : null}
                      {subsection.title}
                    </h3>
                    <Blocks blocks={subsection.blocks} />
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
