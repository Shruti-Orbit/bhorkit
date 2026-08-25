import Fuse, { type FuseResult } from "fuse.js";
import type { CollectionProduct } from "@/src/data/products";
import { getAllProducts } from "@/src/lib/api/product.api";

export type ProductSearchResult = {
  product: CollectionProduct;
  score: number;
  /** Character ranges within product.name that matched the query, for highlighting. */
  nameMatchRanges: [number, number][];
};

// contents.name (the ingredient/item list) was tried and deliberately left
// out: this catalog's kits mostly share the same generic ritual items
// (diya, kumkum, haldi...), so matching against it made nearly every product
// match nearly every query — e.g. "diya" matched all 12 products at a
// perfect score, since every kit happens to include one. Searching only the
// fields that actually describe *what a product is* (name/subtitle/
// category) gives far better precision for this catalog.
const fuseOptions: ConstructorParameters<typeof Fuse<CollectionProduct>>[1] = {
  keys: [
    { name: "name", weight: 0.6 },
    { name: "subtitle", weight: 0.25 },
    { name: "shopCategory", weight: 0.15 },
  ],
  includeScore: true,
  includeMatches: true,
  threshold: 0.3,
  ignoreLocation: true,
  minMatchCharLength: 2,
};

// Fuse's `threshold` bounds how fuzzy an individual *key* match may be, not
// the final weighted score — with multiple weighted keys a document can
// still surface with a combined score well above `threshold` (observed up
// to 0.6 in testing against the real catalog). This is the actual relevance
// cutoff applied to the merged/aggregated score.
const MAX_RELEVANT_SCORE = 0.3;

// Cached at module scope (not component state) so every SearchBox instance —
// the desktop header, the mobile header, the /search page — shares one fetch
// of the catalog instead of each re-requesting it.
let catalogPromise: Promise<CollectionProduct[]> | null = null;

export function getCatalog(): Promise<CollectionProduct[]> {
  if (!catalogPromise) {
    catalogPromise = getAllProducts().catch((error) => {
      // Let the next call retry instead of caching a permanent failure.
      catalogPromise = null;
      throw error;
    });
  }
  return catalogPromise;
}

let indexPromise: Promise<Fuse<CollectionProduct>> | null = null;

export function getSearchFuse(): Promise<Fuse<CollectionProduct>> {
  if (!indexPromise) {
    indexPromise = getCatalog()
      .then((products) => new Fuse(products, fuseOptions))
      .catch((error) => {
        indexPromise = null;
        throw error;
      });
  }
  return indexPromise;
}

function nameMatchRangesFor(match: FuseResult<CollectionProduct>["matches"]): [number, number][] {
  const nameMatch = match?.find((entry) => entry.key === "name");
  if (!nameMatch) return [];
  return nameMatch.indices.map(([start, end]) => [start, end + 1]);
}

export async function searchProducts(query: string, limit?: number): Promise<ProductSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const [{ expandQueryVariants }, fuse] = await Promise.all([
    import("@/src/lib/search/synonyms"),
    getSearchFuse(),
  ]);

  const bestByProductId = new Map<string, FuseResult<CollectionProduct>>();
  for (const variant of expandQueryVariants(trimmed)) {
    for (const result of fuse.search(variant)) {
      const existing = bestByProductId.get(result.item.id);
      const score = result.score ?? 1;
      if (!existing || score < (existing.score ?? 1)) {
        bestByProductId.set(result.item.id, result);
      }
    }
  }

  const ranked = Array.from(bestByProductId.values())
    .filter((result) => (result.score ?? 1) <= MAX_RELEVANT_SCORE)
    .sort((a, b) => (a.score ?? 1) - (b.score ?? 1));
  const limited = typeof limit === "number" ? ranked.slice(0, limit) : ranked;

  return limited.map((result) => ({
    product: result.item,
    score: result.score ?? 1,
    nameMatchRanges: nameMatchRangesFor(result.matches),
  }));
}
