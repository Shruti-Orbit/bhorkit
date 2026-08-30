export type HeroSlide = {
  id: number;
  image: string;
  imageAlt: string;
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
    image: "/images/slider/slider-1.png",
    imageAlt:
      "BHORKIT Ganesh puja kit with Ganesh idol, diya, flowers and devotional essentials",
    eyebrow: "GANESH CHATURTHI 2025",
    title: "Bring Home",
    highlightedTitle: "Bappa's Blessings",
    description:
      "Premium puja kits, thoughtfully curated with devotion and delivered across Patna.",
    primaryCta: "PRE-ORDER GANESH KITS →",
    primaryHref: "/shop/ganesh-chaturthi",
    secondaryCta: "EXPLORE COLLECTION",
    secondaryHref: "/shop",
  },
  {
    id: 2,
    image: "/images/slider/slider-2.png",
    imageAlt:
      "BHORKIT Ganesh puja kit with premium packaging, Ganesh idol, diya and flowers",
    eyebrow: "GANESH CHATURTHI 2025",
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
