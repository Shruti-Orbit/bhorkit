import { apiGet } from "@/src/lib/api/client";

/** A category visible on the storefront, as the API lists it (hidden ones are never returned). */
export type PublicShopCategory = {
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
  /** Slugs the category used to have. /shop/<old> redirects to the current slug. */
  previousSlugs: string[];
};

/**
 * The visible categories, in display order. Read fresh on every request so a
 * category an admin hides or renames changes the storefront straight away.
 * Fails soft to an empty list: the menu losing its categories is better than
 * the whole page failing to render.
 */
export async function getShopCategories(): Promise<PublicShopCategory[]> {
  try {
    return (await apiGet<PublicShopCategory[]>("/categories")).data;
  } catch {
    return [];
  }
}
