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
  image: string;
  imageAlt: string;
  features: PromotionFeature[];
};

export const navratriPromotion: Promotion = {
  eyebrow: "NAVRATRI 2026",
  title: "Pre-Order Now",
  description: "Reserve your Navratri kits and get them in time for the first day.",
  ctaLabel: "PRE-ORDER NOW",
  ctaHref: "/pre-order",
  image: "/images/durga-maa.png",
  imageAlt: "Durga Maa celebration artwork for Navratri",
  features: [
    {
      icon: "PackageOpen",
      title: "Reserved For You",
      description: "Kits Held Till Delivery",
    },
    {
      icon: "Gift",
      title: "Special Launch",
      description: "Offers",
    },
    {
      icon: "Truck",
      title: "Timely Delivery",
      description: "Before Navratri",
    },
  ],
};
