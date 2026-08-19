// Devotional/puja vocabulary has no single "correct" English spelling — the
// catalog itself mixes them (category "Regular Puja" vs. collection key
// "regular-pooja"), and shoppers will type whichever transliteration they
// know. Each inner array is a group of interchangeable spellings/terms.
const SYNONYM_GROUPS: string[][] = [
  ["puja", "pooja", "poojan"],
  ["ganesh", "ganesha", "ganpati", "ganapati"],
  ["durva", "doob", "dhruva"],
  ["kalash", "kalasha", "kalsha"],
  ["aarti", "arti", "aarthi"],
  ["diya", "deepak", "deepam", "diyas"],
  ["kumkum", "kumkuma", "kunkum"],
  ["haldi", "turmeric"],
  ["dhoop", "dhup"],
  ["agarbatti", "agarbatti", "incense", "batti"],
  ["navratri", "navratra", "navaratri"],
  ["essentials", "essential"],
  ["kit", "kits"],
];

const canonicalByTerm = new Map<string, string>();
for (const group of SYNONYM_GROUPS) {
  const [canonical] = group;
  for (const term of group) {
    canonicalByTerm.set(term, canonical);
  }
}

const groupByCanonical = new Map<string, string[]>();
for (const group of SYNONYM_GROUPS) {
  groupByCanonical.set(group[0], group);
}

/**
 * Given a raw search query, returns the query itself plus one variant per
 * word that has a known synonym, with that single word swapped for each of
 * its alternate spellings. Kept to single-word substitutions (not every
 * combination) since search queries here are short and this keeps the
 * variant count small and fast to run through Fuse repeatedly.
 */
export function expandQueryVariants(query: string): string[] {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const variants = new Set<string>([query]);

  words.forEach((word, index) => {
    const canonical = canonicalByTerm.get(word);
    if (!canonical) return;

    const group = groupByCanonical.get(canonical) ?? [];
    for (const alternate of group) {
      if (alternate === word) continue;
      const nextWords = [...words];
      nextWords[index] = alternate;
      variants.add(nextWords.join(" "));
    }
  });

  return Array.from(variants);
}
