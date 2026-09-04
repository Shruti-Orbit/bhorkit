import type { CollectionProduct } from "@/src/data/products";

const navratriComingSoonImages = [
  "/images/coming-soon/coming-soon-1.png",
  "/images/coming-soon/coming-soon-2.png",
  "/images/coming-soon/coming-soon-3.png",
  "/images/coming-soon/coming-soon-4.png",
];

const navratriComingSoonDescriptions = [
  "Daily essentials for your home mandir.",
  "First-day essentials for Shubh Aarambh.",
  "Nine days of puja, thoughtfully planned.",
  "A complete Navratri ritual experience.",
];

export function withNavratriComingSoonPresentation(products: CollectionProduct[]) {
  return products.map((product, index) => ({
    ...product,
    description: navratriComingSoonDescriptions[index % navratriComingSoonDescriptions.length],
    image: navratriComingSoonImages[index % navratriComingSoonImages.length],
    imageAlt: `${product.name} Navratri puja kit coming soon preview`,
  }));
}
