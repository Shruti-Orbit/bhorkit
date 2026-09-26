/**
 * Photos for the Customize Order items.
 *
 * The API sends only a name for each item, so the storefront matches the name
 * against the samagri it has photos of (cut from the kit ingredient sheets in
 * /public/images/customize). Items it can't match fall back to a plain tile.
 * Order matters: more specific words come first ("mitti ke diye" before "diya").
 */
const PHOTOS: Array<[slug: string, words: string[]]> = [
  ["mitti-diye", ["mitti", "diye"]],
  ["dhoop-sticks", ["dhoop stick", "dhoopbatti", "dhoop batti"]],
  ["agarbatti", ["agarbatti", "agarbati", "incense"]],
  ["cotton-batti", ["cotton", "batti", "wick", "baati"]],
  ["fresh-flowers", ["flower", "phool", "pushp"]],
  ["mango-leaves", ["mango", "aam", "pallav"]],
  ["paan", ["paan", "pan patta", "betel leaf", "betel leaves"]],
  ["supari", ["supari", "betel nut", "areca"]],
  ["akshat", ["akshat", "rice", "chawal"]],
  ["coconut", ["coconut", "nariyal", "narial", "shriphal"]],
  ["guggal", ["guggal", "guggul", "gugal"]],
  ["loban", ["loban", "lobaan", "benzoin"]],
  ["kapoor", ["kapoor", "kapur", "camphor"]],
  ["haldi", ["haldi", "turmeric"]],
  ["kumkum", ["kumkum", "kumkumam"]],
  ["roli", ["roli"]],
  ["sindoor", ["sindoor", "sindur", "vermilion"]],
  ["chandan", ["chandan", "sandal"]],
  ["mauli", ["mauli", "moli", "kalawa", "kalava", "raksha sutra"]],
  ["janeu", ["janeu", "janeoo", "yagyopavit", "sacred thread"]],
  ["ghee", ["ghee", "ghi"]],
  ["mishri", ["mishri", "misri", "sugar"]],
  ["elaichi", ["elaichi", "cardamom"]],
  ["laung", ["laung", "lavang", "clove"]],
  ["dalchini", ["dalchini", "cinnamon"]],
  ["dhoop", ["dhoop", "dhup", "cone"]],
  ["diya", ["diya", "deepak", "lamp"]],
  ["kalash", ["kalash", "lota"]],
  ["durva", ["durva", "doob", "dhruva", "grass"]],
  ["aasan", ["aasan", "asan", "vastra", "cloth", "chunri", "chunari"]],
];

const cache = new Map<string, string | null>();

/** The photo for an item, or null when there isn't one. */
export function itemImageFor(name: string | null | undefined): string | null {
  const key = (name ?? "").trim().toLowerCase();
  if (!key) return null;
  if (cache.has(key)) return cache.get(key) ?? null;
  const match = PHOTOS.find(([, words]) => words.some((word) => key.includes(word)));
  const src = match ? `/images/customize/${match[0]}.webp` : null;
  cache.set(key, src);
  return src;
}
