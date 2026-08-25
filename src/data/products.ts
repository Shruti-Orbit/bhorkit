export type ShopCategorySlug = "ganesh-chaturthi" | "navratri-upcoming" | "regular-pooja";

export type ProductBadgeTone = "gold" | "success" | "primary" | "soft";
export type ProductPurchaseState = "PRE_ORDER" | "READY_STOCK" | "COMING_SOON";

export type ProductBadge = {
  label: string;
  tone: ProductBadgeTone;
};

export type ProductContentItem = {
  name: string;
  quantity: string;
  unit: string;
};

export type ProductFaq = {
  question: string;
  answer: string;
};

export type ProductReview = {
  customerName: string;
  verified?: boolean;
  date?: string;
  rating: number;
  content: string;
};

export type ProductImage = {
  src: string;
  alt: string;
};

export type CollectionProduct = {
  id: string;
  sku: string;
  slug: string;
  /**
   * The Shop range this product belongs to — one stable slug, matching the
   * backend's `shopCategory`. Mirrors SHOP_CATEGORIES in the API; see
   * src/data/shopCategories.ts for the storefront labels and page copy.
   */
  shopCategory: ShopCategorySlug;
  name: string;
  subtitle: string;
  description: string;
  price: string;
  href: string;
  image: string;
  imageAlt: string;
  badge?: ProductBadge;
  purchaseState: ProductPurchaseState;
  images: ProductImage[];
  rating?: {
    value: number;
    reviewCount: number;
  };
  availability: "preorder" | "available" | "unavailable";
  stock: {
    readyStock: boolean;
  };
  preorder?: {
    title: string;
    description: string;
    expectedDelivery: string;
  };
  delivery: {
    location: string;
    description: string;
    availablePincodes: string[];
    twoHourEligiblePincodes: string[];
    supportsTwoHourDelivery: boolean;
  };
  highlights: {
    title: string;
    description: string;
  }[];
  contents: ProductContentItem[];
  story: {
    eyebrow: string;
    title: string;
    description: string;
    image: string;
    imageAlt: string;
  };
  howToUse: {
    title: string;
    description: string;
  }[];
  packaging: {
    title: string;
    points: string[];
    image: string;
    imageAlt: string;
  };
  faqs: ProductFaq[];
  reviews: ProductReview[];
};

const sharedEssentials: ProductContentItem[] = [
  { name: "Fresh Flowers", quantity: "8-10", unit: "pcs" },
  { name: "Haldi", quantity: "5", unit: "g" },
  { name: "Kumkum", quantity: "5", unit: "g" },
  { name: "Akshat", quantity: "10", unit: "g" },
  { name: "Mauli", quantity: "2", unit: "pcs" },
  { name: "Chandan", quantity: "3", unit: "g" },
  { name: "Kapoor", quantity: "5", unit: "g" },
  { name: "Cotton Batti", quantity: "6", unit: "pcs" },
  { name: "Agarbatti", quantity: "5", unit: "sticks" },
  { name: "Ghee", quantity: "15", unit: "ml" },
  { name: "Mishri", quantity: "10", unit: "g" },
  { name: "Supari", quantity: "1", unit: "pc" },
  { name: "Elaichi", quantity: "2", unit: "pcs" },
  { name: "Laung", quantity: "2", unit: "pcs" },
  { name: "Diya", quantity: "2", unit: "pcs" },
  { name: "Coconut", quantity: "1", unit: "pc" },
  { name: "Mango Leaves", quantity: "5", unit: "pcs" },
  { name: "Ganesh Puja Guide QR", quantity: "1", unit: "pc" },
];

const durvaAddons: ProductContentItem[] = [
  { name: "Fresh Durva Grass", quantity: "1", unit: "bundle" },
  { name: "Ganesh Blessing Card", quantity: "1", unit: "pc" },
];

const clayAddons: ProductContentItem[] = [
  { name: "Natural Suitable Clay", quantity: "250-300", unit: "g" },
  { name: "Simple Ganesh Mould / Template", quantity: "1", unit: "pc" },
  { name: "DIY Ganesha Making Instruction Card", quantity: "1", unit: "pc" },
  { name: "Make Your Own Ganesha QR Tutorial", quantity: "1", unit: "pc" },
];

const decorationAddons: ProductContentItem[] = [
  { name: "Natural / Eco-friendly Decoration Material", quantity: "1", unit: "pack" },
  { name: "Decorative Cloth / Vastra", quantity: "1", unit: "pc" },
  { name: "Small Decorative Crown", quantity: "1", unit: "pc" },
  { name: "Extra Mauli for Decoration", quantity: "1", unit: "pc" },
  { name: "Small Tilak / Chandan Pack", quantity: "1", unit: "pc" },
  { name: "Decoration Guide QR / Card", quantity: "1", unit: "pc" },
];

const commonHighlights = [
  {
    title: "Complete Puja Essentials",
    description: "Everything you need for your Ganesh puja.",
  },
  {
    title: "Carefully Curated",
    description: "Thoughtfully selected for a meaningful celebration.",
  },
  {
    title: "Beautifully Packed",
    description: "Premium packaging, ready to gift or bring home.",
  },
  {
    title: "Made for Home Puja",
    description: "Perfect for your family celebration.",
  },
];

const commonHowToUse = [
  {
    title: "Unbox",
    description: "Everything thoughtfully arranged.",
  },
  {
    title: "Prepare",
    description: "Set up your puja space.",
  },
  {
    title: "Offer",
    description: "Use the curated essentials for your celebration.",
  },
  {
    title: "Celebrate",
    description: "Bring Bappa home with love.",
  },
];

const commonFaqs: ProductFaq[] = [
  {
    question: "Is this kit available for pre-order?",
    answer: "Yes. This product is configured as a pre-order product.",
  },
  {
    question: "Where do you deliver?",
    answer: "BHORKIT currently focuses on doorstep delivery across Patna.",
  },
  {
    question: "What is included?",
    answer: "The exact contents are listed in the What's Inside Your Kit section on this page.",
  },
  {
    question: "Can I gift this kit?",
    answer: "Yes. The kit is designed with premium packaging suitable for gifting.",
  },
  {
    question: "How will I receive my order?",
    answer: "Orders are configured for doorstep delivery in Patna.",
  },
  {
    question: "Can I cancel my pre-order?",
    answer: "Cancellation rules will be connected to the final checkout and order policy.",
  },
];

function createProduct(input: {
  id: string;
  sku: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  price: string;
  image: string;
  badge?: ProductBadge;
  purchaseState?: ProductPurchaseState;
  contents: ProductContentItem[];
}): CollectionProduct {
  const purchaseState = input.purchaseState ?? "PRE_ORDER";

  return {
    ...input,
    purchaseState,
    // Every product this factory builds is a Ganesh Chaturthi one; the other
    // ranges are declared explicitly below.
    shopCategory: "ganesh-chaturthi",
    href: `/products/${input.slug}`,
    imageAlt: `${input.name} by BHORKIT`,
    images: [
      { src: input.image, alt: `${input.name} main product visual` },
      { src: "/images/slider/slider-2.png", alt: `${input.name} lifestyle and packaging visual` },
      { src: "/images/slider/slider-1.png", alt: `${input.name} devotional kit setup visual` },
      { src: "/images/slider/slider-2.png", alt: `${input.name} open box detail visual` },
    ],
    availability: "preorder",
    stock: {
      readyStock: purchaseState === "READY_STOCK",
    },
    preorder: {
      title: "Pre-Order Now",
      description: "Reserve your kit in advance and receive it before Ganesh Chaturthi.",
      expectedDelivery: "Before Ganesh Chaturthi",
    },
    delivery: {
      location: "Patna Delivery",
      description: "Pre-order delivery before Ganesh Chaturthi.",
      availablePincodes: ["800001", "800002", "800003", "800004", "800013", "800014"],
      twoHourEligiblePincodes: ["800001", "800003", "800013"],
      supportsTwoHourDelivery: purchaseState === "READY_STOCK",
    },
    highlights: commonHighlights,
    contents: input.contents,
    story: {
      eyebrow: "More Than a Puja Kit",
      title: "It's a moment of devotion.",
      description:
        "Bappa ko ghar lana sirf ek celebration nahi, ek feeling hai. BHORKIT brings together the essentials you need to make that moment simple, beautiful and meaningful.",
      image: "/images/slider/slider-1.png",
      imageAlt: "BHORKIT devotional puja setup with Ganesh essentials",
    },
    howToUse: commonHowToUse,
    packaging: {
      title: "Beautifully Packed for a Sacred Celebration",
      points: [
        "Premium rigid packaging",
        "Thoughtfully arranged compartments",
        "Easy to store",
        "Beautiful enough for gifting",
      ],
      image: input.image,
      imageAlt: `${input.name} packaging showcase`,
    },
    faqs: commonFaqs,
    reviews: [],
  };
}

export const ganeshChaturthiProducts: CollectionProduct[] = [
  createProduct({
    id: "ganesh-puja-essentials-kit",
    sku: "BHOR-GP-01",
    slug: "ganesh-puja-essentials-kit",
    name: "BHOR Ganesh Puja Essentials Kit",
    subtitle:
      "Everything you need to bring devotion home, beautifully packed for Bappa's celebration.",
    description: "All essential items for a complete puja.",
    price: "₹699",
    image: "/images/slider/slider-1.png",
    badge: { label: "Pre-Order", tone: "gold" },
    contents: sharedEssentials,
  }),
  createProduct({
    id: "ganesh-puja-durva-kit",
    sku: "BHOR-GD-02",
    slug: "ganesh-puja-durva-kit",
    name: "BHOR Ganesh Puja + Durva Kit",
    subtitle: "A complete Ganesh puja kit with fresh Durva for Bappa's celebration.",
    description: "Includes durva, modak ingredients & more.",
    price: "₹799",
    image: "/images/slider/slider-1.png",
    badge: { label: "Pre-Order", tone: "success" },
    contents: [...sharedEssentials, ...durvaAddons],
  }),
  createProduct({
    id: "ganesha-clay-kit",
    sku: "BHOR-GC-03",
    slug: "ganesha-clay-kit",
    name: "Make Your Own Ganesha Clay Kit",
    subtitle: "Create your own Bappa with thoughtfully curated clay-making essentials.",
    description: "Shadu mitti, tools & guide to create your own Bappa.",
    price: "₹499",
    image: "/images/slider/slider-2.png",
    badge: { label: "Pre-Order", tone: "soft" },
    contents: [...sharedEssentials, ...durvaAddons, ...clayAddons],
  }),
  createProduct({
    id: "diy-ganesha-decoration-kit",
    sku: "BHOR-GD-04",
    slug: "diy-ganesha-decoration-kit",
    name: "DIY Ganesha + Decoration Kit",
    subtitle: "A festive DIY kit to decorate, celebrate and welcome Bappa home.",
    description: "Decorate, celebrate & welcome Bappa home.",
    price: "₹899",
    image: "/images/slider/slider-1.png",
    badge: { label: "Pre-Order", tone: "primary" },
    contents: [...sharedEssentials, ...durvaAddons, ...clayAddons, ...decorationAddons],
  }),
];

export const navratriUpcomingProducts: CollectionProduct[] = [
  {
    ...createProduct({
      id: "bhor-daily-puja-kit",
      sku: "BHOR-NV-01",
      slug: "bhor-daily-puja-kit",
      name: "BHOR Daily Puja Kit",
      subtitle: "Daily essentials thoughtfully packed for your home mandir.",
      description: "Everyday puja essentials for a calm devotional routine.",
      price: "Coming Soon",
      image: "/images/durga-maa.png",
      badge: { label: "Coming Soon", tone: "gold" },
      purchaseState: "COMING_SOON",
      contents: sharedEssentials,
    }),
    shopCategory: "navratri-upcoming",
    href: "/pre-order",
  },
  {
    ...createProduct({
      id: "navratri-day-1-shubh-aarambh-kit",
      sku: "BHOR-NV-02",
      slug: "navratri-day-1-shubh-aarambh-kit",
      name: "BHOR Navratri Day 1 Shubh Aarambh Kit",
      subtitle: "A special first-day Navratri kit for a beautiful beginning.",
      description: "Curated essentials for Shubh Aarambh of Navratri.",
      price: "Coming Soon",
      image: "/images/durga-maa.png",
      badge: { label: "Coming Soon", tone: "primary" },
      purchaseState: "COMING_SOON",
      contents: sharedEssentials,
    }),
    shopCategory: "navratri-upcoming",
    href: "/pre-order",
  },
  {
    ...createProduct({
      id: "navratri-daily-puja-kit",
      sku: "BHOR-NV-03",
      slug: "navratri-daily-puja-kit",
      name: "BHOR Navratri Daily Puja Kit",
      subtitle: "Daily devotional essentials for all nine days of Navratri.",
      description: "Thoughtfully arranged daily puja essentials.",
      price: "Coming Soon",
      image: "/images/durga-maa.png",
      badge: { label: "Coming Soon", tone: "soft" },
      purchaseState: "COMING_SOON",
      contents: sharedEssentials,
    }),
    shopCategory: "navratri-upcoming",
    href: "/pre-order",
  },
  {
    ...createProduct({
      id: "navratri-9-day-subscription",
      sku: "BHOR-NV-04",
      slug: "navratri-9-day-subscription",
      name: "BHOR Navratri 9-Day Subscription",
      subtitle: "A planned devotional experience for every day of Navratri.",
      description: "Nine-day puja essentials planned for your celebration.",
      price: "Coming Soon",
      image: "/images/durga-maa.png",
      badge: { label: "Coming Soon", tone: "success" },
      purchaseState: "COMING_SOON",
      contents: sharedEssentials,
    }),
    shopCategory: "navratri-upcoming",
    href: "/pre-order",
  },
];

export const regularPoojaKits: CollectionProduct[] = [
  {
    ...createProduct({
      id: "daily-puja-essentials-kit",
      sku: "BHOR-RP-01",
      slug: "daily-puja-essentials-kit",
      name: "BHOR Daily Puja Essentials Kit",
      subtitle: "Everyday puja essentials thoughtfully packed for your home mandir.",
      description: "Daily samagri for a calm and complete home ritual.",
      price: "₹399",
      image: "/images/banner/banner-3.png",
      badge: { label: "Daily Kit", tone: "success" },
      purchaseState: "READY_STOCK",
      contents: sharedEssentials,
    }),
    shopCategory: "regular-pooja",
    href: "/shop",
  },
  {
    ...createProduct({
      id: "incense-dhoop-kit",
      sku: "BHOR-RP-02",
      slug: "incense-dhoop-kit",
      name: "BHOR Incense & Dhoop Kit",
      subtitle: "Aromatic essentials for peaceful morning and evening worship.",
      description: "Incense, dhoop and diya essentials for everyday devotion.",
      price: "₹299",
      image: "/images/banner/banner-2.png",
      badge: { label: "Popular", tone: "gold" },
      purchaseState: "READY_STOCK",
      contents: sharedEssentials,
    }),
    shopCategory: "regular-pooja",
    href: "/shop",
  },
  {
    ...createProduct({
      id: "pooja-samagri-refill-kit",
      sku: "BHOR-RP-03",
      slug: "pooja-samagri-refill-kit",
      name: "BHOR Pooja Samagri Refill Kit",
      subtitle: "A handy refill of essential ingredients for regular rituals.",
      description: "Haldi, kumkum, akshat and everyday puja ingredients.",
      price: "₹349",
      image: "/images/slider/slider-1.png",
      badge: { label: "Refill", tone: "soft" },
      purchaseState: "READY_STOCK",
      contents: sharedEssentials,
    }),
    shopCategory: "regular-pooja",
    href: "/shop",
  },
  {
    ...createProduct({
      id: "kalash-decor-kit",
      sku: "BHOR-RP-04",
      slug: "kalash-decor-kit",
      name: "BHOR Kalash & Decor Kit",
      subtitle: "Simple festive decor essentials for your home puja setup.",
      description: "Kalash and decor touches for a graceful mandir setup.",
      price: "₹449",
      image: "/images/banner/banner-1.png",
      badge: { label: "Decor", tone: "primary" },
      purchaseState: "READY_STOCK",
      contents: sharedEssentials,
    }),
    shopCategory: "regular-pooja",
    href: "/shop",
  },
];

export function getProductBySlug(slug: string) {
  return ganeshChaturthiProducts.find((product) => product.slug === slug);
}

export function getRelatedProducts(slug: string) {
  return ganeshChaturthiProducts.filter((product) => product.slug !== slug).slice(0, 3);
}
