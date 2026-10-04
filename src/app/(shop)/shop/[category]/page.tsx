import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ShopListing } from "@/src/components/shop/ShopListing";
import { findShopCategory, toShopCategory } from "@/src/data/shopCategories";
import { getShopCategories } from "@/src/lib/api/category.api";
import { getProductsByShopCategory } from "@/src/lib/api/product.api";
import { seoConfig } from "@/src/lib/seo/config";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ category: string }> };

/**
 * Every Shop category renders through this one route rather than a page per
 * category. Categories come from the API, so one an admin adds gets a page
 * straight away, and one they hide or delete stops resolving.
 */
async function resolveCategory(slug: string) {
  const match = findShopCategory(await getShopCategories(), slug);
  return match ? toShopCategory(match) : null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const category = await resolveCategory((await params).category);
  if (!category) return {};
  const path = `/shop/${category.slug}` as keyof typeof seoConfig.pages;
  const seo = seoConfig.pages[path];

  return {
    title: seo?.title ?? `${category.title} | BHORKIT`,
    description: seo?.description ?? category.blurb,
    keywords: seo ? [...seo.keywords] : undefined,
    alternates: {
      canonical: `/shop/${category.slug}`,
    },
  };
}

export default async function ShopCategoryPage({ params }: Params) {
  const slug = (await params).category;
  const category = await resolveCategory(slug);
  // An unknown or hidden slug is a 404, not an empty listing: a mistyped URL
  // should not look like a range that happens to be sold out.
  if (!category) notFound();
  // A slug the category used to have: send the visitor (and search engines)
  // to its current address.
  if (category.slug !== slug) permanentRedirect(`/shop/${category.slug}`);

  const products = await getProductsByShopCategory(category.slug);

  return (
    <ShopListing
      eyebrow={category.eyebrow}
      title={category.title}
      sections={[
        {
          key: category.slug,
          title: category.listingTitle,
          href: `/shop/${category.slug}`,
          products,
        },
      ]}
    />
  );
}
