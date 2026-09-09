import type { MetadataRoute } from "next";
import { absoluteUrl, seoConfig } from "@/src/lib/seo/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: [
          "Googlebot",
          "Googlebot-Image",
          "Bingbot",
          "Yandex",
          "Baiduspider",
          "Applebot",
          "DuckDuckBot",
          "Slurp",
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "Google-Extended",
          "ClaudeBot",
          "anthropic-ai",
          "PerplexityBot",
          "Perplexity-User",
          "CCBot",
          "Bytespider",
          "Amazonbot",
          "Applebot-Extended",
          "Meta-ExternalAgent",
          "cohere-ai",
          "AhrefsBot",
          "SemrushBot",
          "MJ12bot",
          "DotBot",
          "BLEXBot",
          "DataForSeoBot",
          "archive.org_bot",
        ],
        allow: "/",
      },
      {
        userAgent: "*",
        allow: "/",
        // The account, cart, checkout and admin routes used to be disallowed
        // here. Blocking a route is the wrong tool for keeping it out of the
        // index: a crawler that cannot fetch a page also cannot read the
        // `noindex` on it, so a URL that gets linked can still be listed —
        // with no title or description, because the crawler was never allowed
        // to look. Those routes now carry `noindex` in their own layouts
        // instead, which says the same thing in the one place a crawler will
        // actually read it. See app/(shop)/{account,cart,checkout}/layout.tsx
        // and app/admin/layout.tsx.
        disallow: ["/cgi-bin/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: seoConfig.siteUrl,
  };
}