import type { Metadata } from "next";
import { ShopListing } from "@/src/components/shop/ShopListing";
import type { ShopListingSection } from "@/src/components/shop/ShopListing";
import { shopSections } from "@/src/data/shopSections";
import { getAllProducts } from "@/src/lib/api/product.api";
import { seoConfig } from "@/src/lib/seo/config";

export const dynamic = "force-dynamic";

const pageSeo = seoConfig.pages["/shop"];

export const metadata: Metadata = {
  title: pageSeo.title,
  description: pageSeo.description,
  keywords: [...pageSeo.keywords],
  alternates: {
    canonical: "/shop",
  },
};

/**
 * Shop All — the whole catalogue, grouped by what a shopper can actually do
 * with each kit.
 *
 * The header's Shop entry now opens a category dropdown instead of navigating
 * here, so this page is reached directly or from the footer. It used to fetch
 * only the Ganesh Chaturthi collection while titled "Shop All", which is the
 * behaviour the dropdown replaced; showing every product makes the page match
 * its own heading, and each individual range has its own /shop/<category> URL.
 *
 * Those twelve products then arrived as one undifferentiated grid, so they are
 * grouped into the three ranges the headings name — the same split, and the
 * same copy, a shopper meets on the home page.
 */
export default async function ShopPage() {
  const products = await getAllProducts();

  // Driven by shopSections so the order and copy live in one place, and a range
  // the API starts returning cannot silently vanish from the page.
  const sections: ShopListingSection[] = shopSections.map((section) => ({
    key: section.slug,
    title: section.title,
    description: section.description,
    tone: section.tone,
    variant: section.variant,
    products: products.filter((product) => product.shopCategory === section.slug),
  }));

  return (
    <ShopListing
      eyebrow="Shop All"
      title="BHORKIT Puja Essentials"
      sections={sections}
    />
  );
}
