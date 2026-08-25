export type NavigationItem = {
  label: string;
  href: string;
  dropdown?: boolean;
  badge?: string;
};

export const navigation: NavigationItem[] = [
  {
    label: "Shop",
    href: "/shop",
    dropdown: true,
  },
  {
    // The Regular Pooja Kits listing. A top-level path, not /shop/..., because
    // Navbar and MobileMenu mark an item active with pathname.startsWith(href)
    // — nesting this under /shop would light up the Shop link on this page too.
    label: "Puja Kits",
    href: "/puja-kits",
  },
  {
    label: "Festival Collections",
    href: "/collections/festivals",
  },
  {
    label: "Pre-Order",
    href: "/pre-order",
    badge: "New",
  },
  {
    label: "Track Order",
    href: "/track-order",
  },
];
