import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/src/lib/seo/config";
import { shopCategories } from "@/src/data/shopCategories";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    "/",
    "/shop",
    "/puja-kits",
    "/pre-order",
    "/support",
    "/policies",
    "/collections/festivals",
    ...shopCategories.map((category) => `/shop/${category.slug}`),
  ];

  return routes.map((route) => ({
    url: absoluteUrl(route),
    lastModified: now,
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
