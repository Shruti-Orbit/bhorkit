import type { MetadataRoute } from "next";
import { absoluteUrl, seoConfig } from "@/src/lib/seo/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/account",
          "/cart",
          "/checkout",
          "/orders",
          "/wishlist",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: seoConfig.siteUrl,
  };
}
