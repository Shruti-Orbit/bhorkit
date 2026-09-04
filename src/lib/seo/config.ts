import type { CollectionProduct } from "@/src/data/products";

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bhorkit.com";

export const seoConfig = {
  siteName: "Bhorkit",
  locale: "en_IN",
  siteUrl: rawSiteUrl.replace(/\/$/, ""),
  organizationName: "BHORKIT",
  contactEmail: "bhorkit@gmail.com",
  areaServed: "Patna, Bihar, India",
  socialLinks: {
    instagram: "https://www.instagram.com/bhor.kit/",
    facebook: "https://www.facebook.com/bhorkit",
    youtube: "https://youtube.com/@bhorkit?si=tpya00V8zovz_uhd",
  },
  home: {
    title: "Puja Kit in Patna | Complete Puja Needs Online – Bhorkit",
    description:
      "Shop Puja Kit in Patna online with Bhorkit. Get essential puja samagri and ritual items in one place, conveniently packed and delivered to your doorstep.",
    path: "/",
    keywords: [
      "puja kit in patna",
      "puja kit online patna",
      "puja samagri patna",
      "puja samagri online patna",
      "puja essentials patna",
      "puja items online patna",
      "complete puja kit patna",
      "puja kit delivery patna",
      "buy puja kit online patna",
    ],
    ogImage: {
      url: "/images/banner/first-hero.png",
      width: 1774,
      height: 887,
      type: "image/png",
      alt: "BHORKIT puja kit in Patna with puja samagri and devotional essentials",
    },
  },
} as const;

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${seoConfig.siteUrl}${normalizedPath}`;
}

export function createHomeJsonLd(products: CollectionProduct[]) {
  const itemList = products.slice(0, 12).map((product, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Product",
      name: product.name,
      description: product.description,
      image: absoluteUrl(product.image),
      url: absoluteUrl(product.href),
      brand: {
        "@type": "Brand",
        name: seoConfig.organizationName,
      },
    },
  }));

  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: seoConfig.organizationName,
      url: seoConfig.siteUrl,
      logo: absoluteUrl("/images/logo/bhor-kit-logo.png"),
      email: seoConfig.contactEmail,
      sameAs: Object.values(seoConfig.socialLinks),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: seoConfig.siteName,
      url: seoConfig.siteUrl,
      inLanguage: "en-IN",
      potentialAction: {
        "@type": "SearchAction",
        target: `${absoluteUrl("/search")}?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: seoConfig.organizationName,
      url: seoConfig.siteUrl,
      image: absoluteUrl(seoConfig.home.ogImage.url),
      email: seoConfig.contactEmail,
      areaServed: {
        "@type": "City",
        name: "Patna",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "BHORKIT puja products online in Patna",
      itemListElement: itemList,
    },
  ];
}
