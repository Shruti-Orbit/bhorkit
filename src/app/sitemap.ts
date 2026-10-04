import type { MetadataRoute } from "next";
import { getShopCategories } from "@/src/lib/api/category.api";
import { getAllProducts } from "@/src/lib/api/product.api";
import { absoluteUrl } from "@/src/lib/seo/config";

const publicStaticRoutes = [
  "/",
  "/shop",
  "/puja-kits",
  "/customize",
  "/pre-order",
  "/support",
  "/faq",
  "/policies",
  "/collections/festivals",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([getAllProducts(), getShopCategories()]);
  const shopCategoryRoutes = categories.map(
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
