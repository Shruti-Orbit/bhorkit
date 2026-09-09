import type { Metadata } from "next";

/**
 * Exists only to carry the robots directive for the whole account section.
 *
 * One layout covers /account and everything under it — addresses, orders, an
 * individual order, saved items — because metadata is inherited down the
 * segment tree. Repeating the directive on each page would be five copies of
 * one decision, and a new account page added later would quietly miss it.
 *
 * These pages show one signed-in person their own data, so there is nothing
 * here for a search engine to index. `follow` stays on: the links out of them
 * lead to ordinary product pages that should be indexed.
 *
 * It has to be a layout rather than page-level metadata because every page in
 * this section is a client component, and a client component cannot export
 * `metadata` — Next ignores it silently. app/admin/layout.tsx does the same.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
