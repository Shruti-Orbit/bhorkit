import { toShopCategory } from "@/src/data/shopCategories";
import type { PublicShopCategory } from "@/src/lib/api/category.api";

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

const pageItems: NavigationItem[] = [
  {
    // The Regular Pooja Kits listing. A top-level path, not /shop/..., because
    // Navbar and MobileMenu mark an item active with pathname.startsWith(href)
    // — nesting this under /shop would light up the Shop link on this page too.
    label: "Puja Kits",
    href: "/puja-kits",
  },
  {
    // One builder for any puja: the customer fills their own box.
    label: "Customize Order",
    href: "/customize",
  },
  {
    label: "Festival Collections",
    href: "/collections/festivals",
  },
  {
    // Navratri kits take pre-orders now; the path is unchanged so older links
    // and the festival collections keep working.
    label: "Navratri 2026",
    href: "/pre-order",
    badge: "New",
  },
  {
    label: "Help & Support",
    href: "/support",
  },
];

/** The header navigation, with the Shop menu listing the visible categories in display order. */
export function buildNavigation(categories: readonly PublicShopCategory[]): NavigationItem[] {
  return [
    {
      // Opens the category menu rather than navigating — picking a range is the
      // point, and "Shop" on its own used to land on the Ganesh collection.
      // /shop (Shop All) is still reachable directly and from the footer.
      label: "Shop",
      href: "/shop",
      children: [
        ...categories.map(toShopCategory).map((category) => ({
          label: category.label,
          href: `/shop/${category.slug}`,
          blurb: category.blurb,
        })),
        // Puja Add-ons sit in this menu but are NOT a category. They carry no
        // shopCategory and have no detail pages. The page behind this link is a
        // STATIC route, which Next matches ahead of /shop/[category]; the API
        // reserves the slug so no category can be created over it.
        {
          label: "Puja Add-ons",
          href: "/shop/puja-addons",
          blurb: "Small extras to complete your puja.",
        },
      ],
    },
    ...pageItems,
  ];
}
