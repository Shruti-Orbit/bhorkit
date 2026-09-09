import type { Metadata } from "next";

/**
 * Exists only to carry the search page's robots directive.
 *
 * `search/page.tsx` is a client component, and a client component cannot
 * export `metadata` — so the directive lives in a server layout wrapping it,
 * the same arrangement `app/admin/layout.tsx` uses for the same reason.
 *
 * Search results are generated from a query string: every distinct `?q=`
 * produces another URL over the same catalogue, which is thin, duplicative
 * content that search engines do not want indexed. `follow` stays on, though —
 * the product links on a results page are ordinary links to pages that *should*
 * be indexed, and there is no reason to waste them.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
