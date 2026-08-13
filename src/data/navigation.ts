export type NavigationItem = {
  label: string;
  href: string;
  dropdown?: boolean;
  badge?: string;
};

export const navigation: NavigationItem[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Shop",
    href: "/shop",
    dropdown: true,
  },
  {
    label: "Pre-Order",
    href: "/pre-order",
    badge: "New",
  },
  {
    label: "About Us",
    href: "/about",
  },
  {
    label: "Blog",
    href: "/blog",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];
