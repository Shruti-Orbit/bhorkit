import type { CollectionProduct, ProductContentItem } from "@/src/data/products";

/**
 * One line in the kit list, grouped or flat.
 *
 * `quantity` is optional here where `ProductContentItem` requires it, which
 * makes a backend content row assignable to this without conversion — the same
 * chip renders both, and the flat list keeps showing amounts exactly as it
 * always has. A grouped line with no amount renders as a plain check line.
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
 * The grouping comes from the product itself — `contentGroups`, set per product
 * in the admin panel — so no product slug appears anywhere in the UI: the
 * component asks "does this kit have groups?" and renders accordingly.
 *
 * Names and units are resolved from the product's own `contents` by
 * `ingredientId`, never repeated in the grouping. Rename an ingredient in the
 * inventory and the new name shows up on every day it appears in.
 */
export function resolveKitGroups(product: CollectionProduct): KitGroup[] | null {
  const groups = product.contentGroups;
  if (!groups || groups.length === 0) {
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

  const resolved = groups.map((group) => ({
    id: group.id,
    label: group.label,
    title: group.title,
    items: group.items.flatMap<KitItem>((line) => {
      const backing = byIngredientId.get(line.ingredientId);

      // An ingredient taken off the kit list leaves nothing truthful to render,
      // so the line is dropped rather than shown as a blank — the admin form
      // flags it long before it can be saved.
      if (!backing) {
        return [];
      }

      return [{
        name: backing.name,
        ...(line.quantity ? { quantity: line.quantity } : {}),
        unit: backing.unit,
      }];
    }),
  }));

  // A breakdown whose every line failed to resolve would render as a row of
  // empty accordions, which is worse than the flat list it replaced.
  return resolved.some((group) => group.items.length > 0) ? resolved : null;
}
