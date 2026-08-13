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
  eyebrow: "NAVRATRI 2025",
  title: "Pre-Orders Open!",
  description: "Be the first to prepare for Navratri.",
  ctaLabel: "EXPLORE PRE-ORDER",
  ctaHref: "/pre-order",
  image: "/images/durga-maa.png",
  imageAlt: "Durga Maa celebration artwork for Navratri",
  features: [
    {
      icon: "PackageOpen",
      title: "Early Access",
      description: "to Unlimited Kits",
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
