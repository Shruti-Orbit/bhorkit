import type { Metadata } from "next";
import { ShopListing } from "@/src/components/shop/ShopListing";
import type { ShopListingSection } from "@/src/components/shop/ShopListing";
import { sectionLook } from "@/src/data/shopSections";
import { getShopCategories } from "@/src/lib/api/category.api";
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
 * The products are grouped by category rather than shown as one
 * undifferentiated grid. Hidden categories, and their products, are not
 * returned by the API at all.
 */
export default async function ShopPage() {
  const [products, categories] = await Promise.all([getAllProducts(), getShopCategories()]);

  // One section per visible category, in the admin's display order, so a new
  // category can never be missing from a page titled "Shop All".
  const sections: ShopListingSection[] = categories.map((category) => ({
    key: category.slug,
    title: category.name,
    description: category.description,
    ...sectionLook(category),
    products: products.filter((product) => product.shopCategory === category.slug),
  }));

  return (
    <ShopListing
      eyebrow="Shop All"
      title="BHORKIT Puja Essentials"
      sections={sections}
    />
  );
}
