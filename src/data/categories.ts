/**
 * Catalogue category names, exactly as stored on each product document.
 *
 * These are the values the products API filters on (`GET /products?category=`),
 * so they must match the data character for character — which is why they live
 * here as named constants rather than being retyped at each call site.
 *
 * Note the storefront label and the stored value differ: the category is
 * "Regular Puja", while the homepage section and the Puja Kits nav entry
 * present it as "Regular Pooja Kits". The label is presentation; the value is
 * data.
 */
export const catalogCategories = {
  regularPuja: "Regular Puja",
} as const;

export const shoppingCategories = [
  {
    id: "puja-kits",
    label: "Puja Kits",
    href: "/shop",
    image: "/images/slider/slider-1.png",
  },
  {
    id: "flowers",
    label: "Flowers",
    href: "/shop",
    image: "/images/banner/banner-3.png",
  },
  {
    id: "incense-diyas",
    label: "Incense & Diyas",
    href: "/shop",
    image: "/images/banner/banner-2.png",
  },
  {
    id: "puja-essentials",
    label: "Puja Essentials",
    href: "/shop",
    image: "/images/banner/banner-2.png",
  },
  {
    id: "decor-accessories",
    label: "Decor & Accessories",
    href: "/shop",
    image: "/images/banner/banner-1.png",
  },
  {
    id: "ghee-oils",
    label: "Ghee & Oils",
    href: "/shop",
    image: "/images/banner/banner-2.png",
  },
  {
    id: "puja-thali",
    label: "Puja Thali",
    href: "/shop",
    image: "/images/banner/banner-3.png",
  },
  {
    id: "return-gifts",
    label: "Return Gifts",
    href: "/shop",
  },
  {
    id: "festive-offers",
    label: "Festive Offers",
    href: "/shop",
  },
  {
    id: "pre-order",
    label: "Pre-Order",
    href: "/pre-order",
  },
];
