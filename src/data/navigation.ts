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
    label: "Puja Kits",
    href: "/shop?category=puja-kits",
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
