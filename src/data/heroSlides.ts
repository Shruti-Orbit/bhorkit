export type HeroSlide = {
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
  secondaryCta: string;
  secondaryHref: string;
};

export const heroSlides: HeroSlide[] = [
  {
    id: 1,
    image: "/images/banner/first-hero.png",
    imageMobile: "/images/banner/first-hero-mobile.png",
    imageAlt:
      "BHORKIT puja kit in Patna with Ganesh idol, haldi, kumkum and devotional essentials",
    tint: "#FAEEDF",
    eyebrow: "PUJA ESSENTIALS IN PATNA",
    title: "Puja Kit",
    highlightedTitle: "in Patna",
    description:
      "Buy complete puja kit online in Patna with essential puja samagri packed for doorstep delivery.",
    primaryCta: "SHOP PUJA KITS →",
    primaryHref: "/shop/ganesh-chaturthi",
    secondaryCta: "EXPLORE COLLECTION",
    secondaryHref: "/shop",
  },
  {
    id: 2,
    image: "/images/banner/second-hero.png",
    imageAlt:
      "BHORKIT botanical Ganesh puja kit with brass bowls of puja samagri and a lit diya",
    tint: "#EDEAC6",
    eyebrow: "GANESH CHATURTHI 2026",
    title: "Make Your",
    highlightedTitle: "Puja More Divine",
    description:
      "Thoughtfully curated puja essentials, made for meaningful celebrations.",
    primaryCta: "PRE-ORDER GANESH KITS →",
    primaryHref: "/shop/ganesh-chaturthi",
    secondaryCta: "EXPLORE COLLECTION",
    secondaryHref: "/shop",
  },
];
