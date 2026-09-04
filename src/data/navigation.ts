import { shopCategories } from "@/src/data/shopCategories";

export type NavigationChild = {
  label: string;
  href: string;
  blurb?: string;
};

export type NavigationItem = {
  label: string;
  href: string;
  /**
   * When present the item opens a menu instead of navigating. `href` is still
   * used to decide whether the item is the active section.
   */
  children?: NavigationChild[];
  badge?: string;
};

export const navigation: NavigationItem[] = [
  {
    // Opens the category menu rather than navigating — picking a range is the
    // point, and "Shop" on its own used to land on the Ganesh collection.
    // /shop (Shop All) is still reachable directly and from the footer.
    label: "Shop",
    href: "/shop",
    children: shopCategories.map((category) => ({
      label: category.label,
      href: `/shop/${category.slug}`,
      blurb: category.blurb,
    })),
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
    label: "Coming Soon",
    href: "/pre-order",
    badge: "New",
  },
  {
    label: "Track Order",
    href: "/track-order",
  },
];
