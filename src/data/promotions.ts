import type { PromotionIconName } from "@/src/components/home/pre-order/PreOrderFeature";

export type PromotionFeature = {
  icon: PromotionIconName;
  title: string;
  description: string;
};

export type Promotion = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  /**
   * Not open yet: shown as a "coming soon" announcement, with the button
   * pointing at what can be ordered now instead.
   */
  comingSoon?: boolean;
  image: string;
  imageAlt: string;
  features: PromotionFeature[];
};

export const diwaliPromotion: Promotion = {
  eyebrow: "DIWALI 2026",
  title: "Diwali kits are almost here",
  description:
    "We're putting together puja kits for Lakshmi–Ganesh puja, diyas and everything your Diwali needs.",
  ctaLabel: "Shop Navratri kits",
  ctaHref: "/pre-order",
  comingSoon: true,
  image: "/images/festivals/diwali-diyas.svg",
  imageAlt: "Glowing diyas, rangoli and hanging lanterns for Diwali",
  features: [
    {
      icon: "Sparkles",
      title: "Lakshmi–Ganesh Puja",
      description: "Kits Being Curated",
    },
    {
      icon: "Gift",
      title: "Special Launch",
      description: "Offers",
    },
    {
      icon: "Truck",
      title: "Timely Delivery",
      description: "Before Diwali",
    },
  ],
};
