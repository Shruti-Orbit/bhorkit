import type { Metadata } from "next";
import { seoConfig } from "@/src/lib/seo/config";

/**
 * Exists only to carry the track-order page's metadata.
 *
 * track-order/page.tsx is a client component — it reads the order id from the
 * query string — and a client component cannot export `metadata`. The page
 * itself is a public tool anyone can land on, so unlike /account it stays
 * indexable; only the order it looks up is private, and that is fetched in the
 * browser rather than rendered into the HTML.
 */
const pageSeo = seoConfig.pages["/track-order"];

export const metadata: Metadata = {
  title: pageSeo.title,
  description: pageSeo.description,
  keywords: [...pageSeo.keywords],
  alternates: {
    canonical: "/track-order",
  },
};

export default function TrackOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
