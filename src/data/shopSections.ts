import type { PublicShopCategory } from "@/src/lib/api/category.api";

type SectionLook = {
  /** Section background, matching how the home page tones its ranges. */
  tone: "default" | "muted";
  /** Card treatment, matching the home page's collections. */
  variant: "primary" | "regular" | "upcoming";
};

/**
 * How Shop All dresses each category's section. Keyed by the launch slugs and
 * matched through a category's previous slugs as well, so a renamed category
 * keeps its look. Any other category gets the default.
 *
 * Shop All renders one section per visible category, straight from the API, so
 * a new category can never be missing from a page titled "Shop All".
 */
const LOOKS: Record<string, SectionLook> = {
  "ganesh-chaturthi": { tone: "default", variant: "primary" },
  "regular-pooja": { tone: "default", variant: "regular" },
  "navratri-upcoming": { tone: "muted", variant: "primary" },
};

const DEFAULT_LOOK: SectionLook = { tone: "default", variant: "primary" };

export function sectionLook(category: PublicShopCategory): SectionLook {
  for (const slug of [category.slug, ...category.previousSlugs]) {
    const look = LOOKS[slug];
    if (look) return look;
  }
  return DEFAULT_LOOK;
}
