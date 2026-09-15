/**
 * Day-wise kit breakdowns, keyed by product slug.
 *
 * TEMPORARY. The backend has no notion of grouped contents yet — a product's
 * `contents` is one flat list, each ingredient appearing once with a total
 * amount. That list is the packing list: what is in the box. This file is the
 * usage plan: which of those items a shopper reaches for on which day.
 *
 * The two cannot be derived from one another. Days 2-7 of a Navratri kit all
 * use the same essentials, so one ingredient row belongs to six days at once —
 * a relationship a flat list has nowhere to put. That is the whole reason this
 * file exists, and the reason it can go away once the backend models it.
 *
 * WHAT LIVES HERE: the grouping, and eventually the per-day amounts. Nothing
 * else. Ingredient names and units are NOT repeated here — they are resolved
 * from the product's own `contents` by `ingredientId`, so a rename in the
 * admin panel still reaches this page. See src/lib/product/kitGroups.ts.
 *
 * TO REPLACE THIS WITH BACKEND DATA: see the note at the bottom of
 * src/lib/product/kitGroups.ts. Nothing in the UI has to change.
 */

/**
 * Local aliases for the backend's ingredient ids, so the groups below read as
 * something other than hex. These are lookup keys, not display names — what a
 * shopper actually sees still comes from the API.
 */
const IMG = {
  freshFlowers: "6a96e77a93c9f991491cfce5",
  haldi: "6a96e77a93c9f991491cfce6",
  kumkum: "6a96e77a93c9f991491cfce7",
  akshat: "6a96e77a93c9f991491cfce8",
  mauli: "6a96e77a93c9f991491cfce9",
  chandan: "6a96e77b93c9f991491cfcea",
  kapoor: "6a96e77b93c9f991491cfceb",
  cottonBatti: "6a96e77b93c9f991491cfcec",
  agarbatti: "6a96e77b93c9f991491cfced",
  ghee: "6a96e77b93c9f991491cfcee",
  mishri: "6a96e77b93c9f991491cfcef",
  supari: "6a96e77b93c9f991491cfcf0",
  elaichi: "6a96e77b93c9f991491cfcf1",
  laung: "6a96e77b93c9f991491cfcf2",
  diya: "6a96e77b93c9f991491cfcf3",
  coconut: "6a96e77b93c9f991491cfcf4",
  mangoLeaves: "6a96e77b93c9f991491cfcf5",
} as const;

export type KitGroupItemConfig = {
  /** Backend ingredient id. Name and unit are resolved from it, never written here. */
  ingredientId: string;
  /**
   * How much of it that day.
   *
   * Deliberately absent everywhere below: the per-day amounts have not been
   * decided yet, and a plausible-looking number is worse than no number — it
   * reads as final. A chip with no quantity renders as a plain checklist line.
   * Filling these in later is one field per line, nothing else.
   */
  quantity?: string;
  /**
   * ESCAPE HATCH — an ingredient the backend does not carry on this product.
   *
   * Only Havan Samagri uses this, because it does not exist in the ingredient
   * inventory at all yet. Add it under Inventory in the admin panel, put it on
   * this product, then delete this field and use the real id. Every other item
   * here resolves from the API, which is how it should stay.
   */
  pending?: { name: string; unit: string };
};

export type KitGroupConfig = {
  /** Stable id, used as the React key and the accordion's DOM id. */
  id: string;
  /** Short marker shown first — "Day 1". */
  label: string;
  /** What that day is — "Shubh Aarambh + Ghatasthapana". */
  title: string;
  items: KitGroupItemConfig[];
};

/**
 * The set used on an ordinary Navratri morning. Days 2-7 are the same ritual,
 * so they share one definition rather than six copies — change it here and all
 * six days change together.
 */
const dailyPujaEssentials: KitGroupItemConfig[] = [
  { ingredientId: IMG.freshFlowers },
  { ingredientId: IMG.haldi },
  { ingredientId: IMG.kumkum },
  { ingredientId: IMG.akshat },
  { ingredientId: IMG.chandan },
  { ingredientId: IMG.agarbatti },
  { ingredientId: IMG.diya },
  { ingredientId: IMG.ghee },
  { ingredientId: IMG.cottonBatti },
  { ingredientId: IMG.kapoor },
  { ingredientId: IMG.mishri },
];

const navratriNineDay: KitGroupConfig[] = [
  {
    id: "day-1",
    label: "Day 1",
    title: "Shubh Aarambh + Ghatasthapana",
    // Ghatasthapana sets the kalash up: the coconut, mango leaves and mauli
    // are for the pot itself, the rest is the first day's puja.
    items: [
      { ingredientId: IMG.coconut },
      { ingredientId: IMG.mangoLeaves },
      { ingredientId: IMG.mauli },
      { ingredientId: IMG.supari },
      { ingredientId: IMG.akshat },
      { ingredientId: IMG.haldi },
      { ingredientId: IMG.kumkum },
      { ingredientId: IMG.chandan },
      { ingredientId: IMG.freshFlowers },
      { ingredientId: IMG.diya },
      { ingredientId: IMG.ghee },
      { ingredientId: IMG.cottonBatti },
    ],
  },

  // Days 2 through 7 are the same daily puja. Generated rather than written
  // out six times, so the list above stays the single place to edit them.
  ...[2, 3, 4, 5, 6, 7].map((day) => ({
    id: `day-${day}`,
    label: `Day ${day}`,
    title: "Daily Puja Essentials",
    items: dailyPujaEssentials,
  })),

  {
    id: "day-8",
    label: "Day 8",
    title: "Maha Ashtami + Havan",
    items: [
      ...dailyPujaEssentials,
      {
        // Not in the inventory yet — see `pending` above.
        ingredientId: "pending-havan-samagri",
        pending: { name: "Havan Samagri", unit: "g" },
      },
      { ingredientId: IMG.coconut },
      { ingredientId: IMG.supari },
      { ingredientId: IMG.elaichi },
      { ingredientId: IMG.laung },
    ],
  },
  {
    id: "day-9",
    label: "Day 9",
    title: "Maha Navami",
    items: [
      ...dailyPujaEssentials,
      { ingredientId: IMG.coconut },
      { ingredientId: IMG.supari },
      { ingredientId: IMG.elaichi },
      { ingredientId: IMG.laung },
      { ingredientId: IMG.mauli },
    ],
  },
];

/**
 * Slug -> day-wise breakdown.
 *
 * A product missing from this map has no grouping and renders the flat list it
 * always has. That is the default, and it is why adding this file changed
 * nothing for the other eleven products.
 *
 * The Ganesh Puja Guide QR that sits in this kit's backend contents is absent
 * from every day on purpose: it is a Ganesh insert on a Navratri product, and
 * listing it day by day would repeat a mistake nine times. It still appears in
 * the backend's packing list until someone removes it in the admin panel.
 */
export const productContentGroups: Record<string, KitGroupConfig[]> = {
  "navratri-9-day-subscription": navratriNineDay,
};
