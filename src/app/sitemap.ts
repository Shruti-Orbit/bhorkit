import type { MetadataRoute } from "next";
import { shopCategories } from "@/src/data/shopCategories";
import { getAllProducts } from "@/src/lib/api/product.api";
import { absoluteUrl } from "@/src/lib/seo/config";

const publicStaticRoutes = [
  "/",
  "/shop",
  "/puja-kits",
  "/pre-order",
  "/support",
  "/faq",
  "/policies",
  "/collections/festivals",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();
  const shopCategoryRoutes = shopCategories.map(
    (category) => `/shop/${category.slug}`,
  );
  const productRoutes = products
    .map((product) => product.href)
    .filter((href) => href.startsWith("/products/"));

  return uniqueRoutes([
    ...publicStaticRoutes,
    ...shopCategoryRoutes,
    ...productRoutes,
  ]).map((route) => ({
    url: absoluteUrl(route),
  }));
}

function uniqueRoutes(routes: string[]) {
  return Array.from(new Set(routes));
}
