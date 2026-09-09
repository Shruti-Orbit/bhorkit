import type { Metadata } from "next";
import { seoConfig } from "@/src/lib/seo/config";

/**
 * Exists only to carry the support page's metadata.
 *
 * support/page.tsx is a client component, and a client component cannot export
 * `metadata` — Next ignores it silently, so the page would keep falling back
 * to the root layout's bare "BHORKIT" title. The same arrangement as
 * app/admin/layout.tsx and app/(shop)/search/layout.tsx.
 */
const pageSeo = seoConfig.pages["/support"];

export const metadata: Metadata = {
  title: pageSeo.title,
  description: pageSeo.description,
  alternates: {
    canonical: "/support",
  },
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
