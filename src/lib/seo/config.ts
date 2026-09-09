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
    title: "BHORKIT | Ganesh Puja Kit in Patna | Ganesh Puja Samagri Online",
    description:
      "Shop Ganesh Puja Kits and Ganesh Puja Samagri online in Patna. Get complete puja essentials, Durva and more for a hassle-free Ganpati Puja at home.",
    socialTitle: "Puja Kit in Patna | Complete Puja Needs Online – Bhorkit",
    socialDescription:
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
  pages: {
    "/puja-kits": {
      title: "Puja Kit Online Patna | Complete Puja Essentials at Home",
      description:
        "Buy Puja Kit Online in Patna with all essential puja items. Order complete puja kits online and get quality puja samagri delivered to your doorstep.",
      keywords: ["Puja Kit Online Patna"],
    },
    "/collections/festivals": {
      title: "Puja Samagri Patna | Buy Puja Items Online at Best Price",
      description:
        "Buy Puja Samagri in Patna online with essential puja items for every ritual and festival. Get quality puja items delivered conveniently to your doorstep",
      keywords: ["puja samagri patna"],
    },
    "/shop/ganesh-chaturthi": {
      title: "Ganesh Chaturthi Puja Kit Online | Complete Puja Samagri",
      description:
        "Buy Ganesh Chaturthi Puja Kit Online with essential puja samagri. Get a complete puja kit delivered to your doorstep for a hassle-free celebration.",
      keywords: ["Ganesh Chaturthi Puja Kit Online"],
    },
    "/shop/regular-pooja": {
      title: "Buy Puja Samagri Online Patna | Puja Items Delivered Home",
      description:
        "Buy Puja Samagri Online in Patna with essential puja items for every ritual and festival. Order easily online and get quality puja items delivered home.",
      keywords: ["buy puja samagri online patna"],
    },
    "/shop": {
      title: "Puja Products Online Patna | Shop All BHORKIT Kits",
      description:
        "Browse every BHORKIT puja kit in one place. Shop puja products online in Patna — everyday kits, festival kits and upcoming pre-orders, delivered to your door.",
      keywords: ["puja products online patna"],
    },
    "/pre-order": {
      title: "Navratri Puja Kit Pre-Order | Puja Essentials Patna",
      description:
        "Pre-order your Navratri 2026 kit from BHORKIT. Reserve puja essentials in Patna ahead of the festival and receive them in time for the celebration.",
      keywords: ["puja essentials patna"],
    },
    "/track-order": {
      title: "Track Your Order | Puja Kit Delivery Patna",
      description:
        "Track your BHORKIT order. Enter your order ID to check the status of your puja kit delivery in Patna and see the latest update on its way to you.",
      keywords: ["puja kit delivery patna"],
    },
    // The two entries below carry no keywords on purpose. Support and Policies
    // are not pages anyone reaches by searching for a puja kit, and dressing
    // them up with commercial terms would be stuffing rather than describing.
    // The key is still present, empty: every entry has to have the same shape
    // because /shop/[category] looks entries up by a computed path and reads
    // `.keywords` off whatever it finds.
    "/support": {
      title: "Help & Support | BHORKIT Puja Kits Patna",
      description:
        "Need help with a BHORKIT order, delivery or pre-order? Send us your query or email bhorkit@gmail.com and our Patna team will get back to you.",
      keywords: [],
    },
    "/policies": {
      title: "Policies | BHORKIT",
      description:
        "Shipping & delivery, returns & refunds, privacy, terms & conditions and cancellation policies for BHORKIT.",
      keywords: [],
    },
  },
  products: {
    "daily-puja-essentials-kit": {
      title: "Puja Essentials Online Patna | Buy Puja Items Online",
      description:
        "Buy Puja Essentials Online in Patna with all essential puja items for daily worship, rituals and festivals. Order online and get them delivered to your doorstep.",
      keywords: ["puja essentials online patna"],
    },
    "incense-dhoop-kit": {
      title: "Buy Puja Kit Online Patna | Complete Puja Samagri at Home",
      description:
        "Buy Puja Kit Online in Patna with complete puja samagri for rituals and festivals. Order easily online and get quality puja essentials delivered to your doorstep.",
      keywords: ["buy puja kit online patna"],
    },
    "pooja-samagri-refill-kit": {
      title: "Puja Samagri Online Patna | Buy Puja Items & Kits Online",
      description:
        "Buy Puja Samagri Online in Patna for daily पूजा, rituals and festivals. Shop complete puja items and kits online with convenient doorstep delivery.",
      keywords: ["puja samagri online patna"],
    },
    "kalash-decor-kit": {
      title: "Puja Kit Delivery Patna | Order Puja Kits Online Easily",
      description:
        "Get Puja Kit Delivery in Patna with complete puja samagri for rituals and festivals. Order online and enjoy convenient doorstep delivery of puja essentials.",
      keywords: ["puja kit delivery patna"],
    },
    "ganesh-puja-essentials-kit": {
      title: "Puja Essentials Patna | Buy Puja Samagri Online Easily",
      description:
        "Buy Puja Essentials in Patna online for daily पूजा, rituals and festivals. Shop quality puja samagri and get essential puja items delivered to your doorstep.",
      keywords: ["puja essentials patna"],
    },
    "ganesh-puja-durva-kit": {
      title: "Puja Products Online Patna | Buy Puja Samagri Online",
      description:
        "Buy Puja Products Online in Patna for daily worship, rituals and festivals. Shop quality puja samagri and essentials online with convenient doorstep delivery.",
      keywords: ["puja products online patna"],
    },
    "ganesha-clay-kit": {
      title: "Puja Items Online Patna | Buy Puja Samagri at Home",
      description:
        "Buy Puja Items Online in Patna for daily worship, rituals and festivals. Shop essential puja samagri online and get quality products delivered to your doorstep.",
      keywords: ["puja items online patna"],
    },
    "diy-ganesha-decoration-kit": {
      title: "Complete Pooja Samagri Patna | Buy Puja Items Online",
      description:
        "Buy Complete Pooja Samagri in Patna online for rituals, festivals and daily worship. Get all essential puja items delivered conveniently to your doorstep.",
      keywords: ["complete pooja samagri patna"],
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
