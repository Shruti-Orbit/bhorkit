import type { ShopCategorySlug } from "@/src/data/products";

export type HeroSlide = HeroTextSlide | HeroBannerSlide;

/** Photography with the copy laid over it as text. */
export type HeroTextSlide = {
  kind?: "text";
  id: number;
  image: string;
  /** Portrait artwork used below the `md` breakpoint. Falls back to `image`. */
  imageMobile?: string;
  imageAlt: string;
  /** Flat colour sampled from the artwork's copy space, used to tint the text overlay. */
  tint?: string;
  eyebrow: string;
  title: string;
  highlightedTitle: string;
  description: string;
  primaryCta: string;
  primaryHref: string;
  /**
   * Set when the primary button asks the shopper to order from one range.
   * It is hidden while that range, or the whole store, is not taking orders;
   * the secondary explore button stays.
   */
  primaryCtaRange?: ShopCategorySlug;
  secondaryCta: string;
  secondaryHref: string;
};

/**
 * Finished banner artwork with its copy and button already painted in. It is
 * shown whole (never cropped) and the entire banner is the link.
 */
export type HeroBannerSlide = {
  kind: "banner";
  id: number;
  image: string;
  /** Portrait (940×1672) version for phones. Falls back to `image`. */
  imageMobile?: string;
  imageAlt: string;
  /** The banner's headline, for screen readers and search — the art carries the visible copy. */
  title: string;
  href: string;
};

export const heroSlides: HeroSlide[] = [
  {
    kind: "banner",
    id: 1,
    image: "/images/slider/Complete-Navratri-Puja-Kit-Celebration.png",
    imageMobile: "/images/slider/Premium Navratri Kalash Sthapana Kit.png",
    imageAlt:
      "BHORKIT Complete Navratri Puja Kit — everything for 9 days of devotion in one box, with kalash, diya and flowers",
    title: "Complete Navratri Puja Kit",
    href: "/pre-order",
  },
  {
    kind: "banner",
    id: 2,
    image: "/images/slider/9-Day-Navratri-Puja-Kit-Subscription.png",
    imageMobile: "/images/slider/Navratri 9-Day Puja Kit Poster.png",
    imageAlt:
      "BHORKIT Navratri 9-Day Subscription — nine day-wise curated puja kits, from Kalash Sthapana to Havan",
    title: "Navratri 9-Day Puja Kit Subscription",
    href: "/pre-order",
  },
  {
    kind: "banner",
    id: 3,
    image: "/images/slider/Navratri-Kalash-Sthapana-Kit.png",
    imageMobile: "/images/slider/Navratri Kalash Sthapana Kit (1).png",
    imageAlt:
      "BHORKIT Navratri Kalash Sthapana Kit — a complete set to begin Navratri, with copper kalash and coconut",
    title: "Navratri Kalash Sthapana Kit",
    href: "/pre-order",
  },
];
