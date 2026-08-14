import { ganeshChaturthiProducts, navratriUpcomingProducts } from "./products";

export type FestivalCollection = {
  slug: string;
  name: string;
  title: string;
  description: string;
  image?: string;
  status: "available" | "coming-soon" | "pre-order";
  href: string;
  visualTone: "ganesh" | "navratri" | "diwali" | "rakhi" | "karwa";
};

export type PreOrderDrop = {
  id: string;
  title: string;
  description: string;
  image: string;
  price: string;
  status: "pre-order" | "coming-soon";
  expectedDispatch: string;
  expectedDelivery: string;
  href: string;
};

export const festivalCollections: FestivalCollection[] = [
  {
    slug: "ganesh-chaturthi",
    name: "Ganesh Chaturthi",
    title: "Bring Bappa home.",
    description: "Complete puja kits, flowers and celebration essentials.",
    image: "/images/slider/slider-1.png",
    status: "available",
    href: "/shop/ganesh-chaturthi",
    visualTone: "ganesh",
  },
  {
    slug: "navratri",
    name: "Navratri",
    title: "Nine days of devotion.",
    description: "Daily puja essentials and planned festive collections.",
    image: "/images/durga-maa.png",
    status: "pre-order",
    href: "/pre-order",
    visualTone: "navratri",
  },
  {
    slug: "diwali",
    name: "Diwali",
    title: "Light your celebrations.",
    description: "A warm festive edit for homes, gifts and rituals.",
    status: "coming-soon",
    href: "/pre-order",
    visualTone: "diwali",
  },
  {
    slug: "raksha-bandhan",
    name: "Raksha Bandhan",
    title: "Celebrate the bond.",
    description: "Thoughtful gifting and sacred celebration details.",
    status: "coming-soon",
    href: "/pre-order",
    visualTone: "rakhi",
  },
  {
    slug: "karwa-chauth",
    name: "Karwa Chauth",
    title: "Tradition, thoughtfully curated.",
    description: "Elegant ritual essentials for meaningful festive moments.",
    status: "coming-soon",
    href: "/pre-order",
    visualTone: "karwa",
  },
];

export const featuredFestival = {
  eyebrow: "Featured Collection",
  name: "Ganesh Chaturthi 2026",
  title: "Bring Home Bappa's Blessings",
  description:
    "A thoughtfully curated collection for a beautiful, complete and meaningful Ganesh Chaturthi.",
  href: "/shop/ganesh-chaturthi",
  image: "/images/slider/slider-1.png",
  products: ganeshChaturthiProducts,
};

export const preOrderFeature = {
  eyebrow: "Pre-Order Open",
  name: "Navratri 2026",
  title: "Prepare for Nine Days of Devotion",
  description:
    "Thoughtfully curated essentials for the beginning, middle and everyday moments of Navratri.",
  expectedDispatch: "To be announced",
  image: "/images/festivals/navratri.png",
  products: navratriUpcomingProducts,
};

export const preOrderDrops: PreOrderDrop[] = navratriUpcomingProducts.slice(0, 3).map((product, index) => ({
  id: product.id,
  title: product.name,
  description: product.description,
  image: product.image,
  price: product.price,
  status: index < 2 ? "pre-order" : "coming-soon",
  expectedDispatch: "To be announced",
  expectedDelivery: product.preorder?.expectedDelivery ?? "To be announced",
  href: "/checkout",
}));
