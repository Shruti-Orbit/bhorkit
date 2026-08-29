import type { PolicyBlock, PolicyInline } from "@/src/lib/api/policy.api";

/**
 * Renders the policy block tree the API serves.
 *
 * Shared by the full policies page and the acceptance step inside the login
 * modal so the wording and the formatting a customer agrees to are literally
 * the same components, not two renderings that could drift apart.
 *
 * Every value here becomes a text node. Nothing is ever interpreted as markup,
 * which is what keeps admin-editable content from being able to execute in a
 * customer's browser.
 */
export function PolicyText({ content }: { content: PolicyInline[] }) {
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

export function PolicyBlocks({ blocks }: { blocks: PolicyBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.kind === "paragraph") {
          return (
            <p key={index} className="mt-3 text-bhor-small leading-bhor-body text-bhor-text-muted md:text-bhor-body-mobile">
              <PolicyText content={block.content} />
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
                  <PolicyText content={item} />
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
                  <PolicyText content={item} />
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
                      <PolicyText content={cell} />
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
                        <PolicyText content={cell} />
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