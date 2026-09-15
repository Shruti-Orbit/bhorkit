import type { CollectionProduct, ProductContentItem } from "@/src/data/products";
import { productContentGroups } from "@/src/data/productContentGroups";

/**
 * One line in the kit list, grouped or flat.
 *
 * `quantity` is optional here where `ProductContentItem` requires it, which
 * makes a backend content row assignable to this without conversion — the same
 * chip renders both, and the flat list keeps showing amounts exactly as it
 * always has. A grouped line with no amount yet renders as a plain check line.
 */
export type KitItem = {
  name: string;
  quantity?: string;
  unit: string;
};

/** A named block of kit items — one day of a Navratri kit, one part of anything else. */
export type KitGroup = {
  id: string;
  label: string;
  title: string;
  items: KitItem[];
};

/**
 * The kit's day-wise breakdown, or null when it does not have one.
 *
 * This is the only thing that knows which products are grouped and where the
 * grouping comes from. The component asks "does this kit have groups?" and
 * renders accordingly; it never asks "is this the Navratri subscription?", so
 * no product slug appears in the UI.
 *
 * Names and units come from the product's own `contents`, looked up by
 * `ingredientId`. The configuration supplies only the grouping — rename an
 * ingredient in the admin panel and the new name shows up here too.
 */
export function resolveKitGroups(product: CollectionProduct): KitGroup[] | null {
  const config = productContentGroups[product.slug];
  if (!config) {
    return null;
  }

  // Built once per product rather than scanned per item: a nine-day kit asks
  // for the same ingredient dozens of times.
  const byIngredientId = new Map<string, ProductContentItem>();
  for (const item of product.contents) {
    // `ingredientId` is on every row the API sends but is absent from
    // ProductContentItem, which models only what the UI reads. Narrowed here
    // rather than widened in the type, so the shared type keeps describing the
    // fields every consumer can rely on.
    const id = (item as ProductContentItem & { ingredientId?: string }).ingredientId;
    if (id) {
      byIngredientId.set(id, item);
    }
  }

  const groups = config.map((group) => ({
    id: group.id,
    label: group.label,
    title: group.title,
    items: group.items.flatMap<KitItem>((line) => {
      const backing = byIngredientId.get(line.ingredientId);

      if (backing) {
        return [{ name: backing.name, quantity: line.quantity, unit: backing.unit }];
      }

      // Not on the product yet. `pending` names it so the day can still be
      // shown in full; without one there is nothing truthful to render, so the
      // line is dropped rather than shown as a blank or a raw id. That way a
      // configuration left behind by an ingredient someone removed in the
      // admin panel degrades to a shorter list, not a broken one.
      if (line.pending) {
        return [{ name: line.pending.name, quantity: line.quantity, unit: line.pending.unit }];
      }

      return [];
    }),
  }));

  // A configuration whose every line failed to resolve would render as a row
  // of empty accordions, which is worse than the flat list it replaced.
  return groups.some((group) => group.items.length > 0) ? groups : null;
}

/**
 * WHEN THE BACKEND SUPPLIES GROUPS
 *
 * Add `contentGroups` to CollectionProduct, then the body above becomes:
 *
 *   return product.contentGroups?.length ? product.contentGroups : null;
 *
 * and src/data/productContentGroups.ts is deleted. The component consumes
 * KitGroup[] either way and does not change — that is the point of this file
 * sitting between the two.
 *
 * Worth telling the backend: the grouping needs to be its own array alongside
 * `contents`, not a `day` field on each content row. A single row cannot say
 * "used on days 2 through 7", which is exactly what six identical Navratri
 * mornings need. Keeping `contents` as the packing list also means products
 * without groups keep working untouched.
 */
