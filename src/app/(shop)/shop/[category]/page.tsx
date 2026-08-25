import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopListing } from "@/src/components/shop/ShopListing";
import { findShopCategory, shopCategories } from "@/src/data/shopCategories";
import { getProductsByCollection } from "@/src/lib/api/product.api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ category: string }> };

/**
 * Every Shop category renders through this one route rather than a page per
 * category — /shop/ganesh-chaturthi was already a near copy of /shop, and
 * three of them would have been three copies to keep in step. Adding a range
 * is now an entry in shopCategories, which the nav reads from too.
 */
export function generateStaticParams() {
  return shopCategories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const category = findShopCategory((await params).category);
  if (!category) return {};
  return { title: `${category.title} | BHORKIT`, description: category.blurb };
}

export default async function ShopCategoryPage({ params }: Params) {
  const category = findShopCategory((await params).category);
  // An unknown slug is a 404, not an empty listing: a mistyped URL should not
  // look like a range that happens to be sold out.
  if (!category) notFound();

  const products = await getProductsByCollection(category.collection);

  return (
    <ShopListing
      eyebrow={category.eyebrow}
      title={category.title}
      listingHref={`/shop/${category.slug}`}
      listingTitle={category.listingTitle}
      products={products}
    />
  );
}
