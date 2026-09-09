import type { Metadata } from "next";

/**
 * Exists only to carry the cart's robots directive.
 *
 * A cart is one shopper's own basket — empty for everyone else, and for a
 * crawler always empty — so there is nothing here worth indexing. `follow`
 * stays on: the cart links back to the product pages, which should be.
 *
 * A layout rather than page-level metadata because cart/page.tsx is a client
 * component, and a client component cannot export `metadata`.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
