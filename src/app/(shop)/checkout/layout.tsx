import type { Metadata } from "next";

/**
 * Exists only to carry the robots directive for checkout and its success page.
 *
 * One layout covers both, since metadata is inherited by the segments beneath
 * it. Checkout is a step in one person's order, and /checkout/success shows a
 * specific order that has just been placed — neither is a page a search
 * result should ever land someone on. `follow` stays on for the links back
 * into the catalogue.
 *
 * A layout rather than page-level metadata because both pages are client
 * components, and a client component cannot export `metadata`.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
