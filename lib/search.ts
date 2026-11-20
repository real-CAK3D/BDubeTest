import { dist, norm, tokens } from "./chat-brain";
import type { Design, Product } from "./types";

/*
 * EDIT-POINT: SHOP-SEARCH
 * The search box in the shop. Forgiving: plurals and word endings don't
 * matter ("tumblers" finds "tumbler"), small typos are fine ("tumblr"), and
 * everyday words map to the shop's own (the chat's word list in
 * lib/chat-brain.ts, e.g. "cup" -> tumbler). Names count most, then category,
 * then the description, sizes and designs that fit.
 */
const STOP = new Set(["a", "an", "the", "for", "with", "and", "of", "to", "in", "my", "i", "me", "some", "any"]);

export function searchProducts(products: Product[], designs: Design[], query: string) {
  const want = tokens(query).filter((w) => !STOP.has(w)).map(norm).filter(Boolean).slice(0, 8);
  if (!want.length) return products;
  const scored = products.map((p) => {
    const fitting = p.designs ? Object.values(p.designs.fit).flat().map((id) => designs.find((d) => d.id === id)?.name ?? "").join(" ") : "";
    const fields: [string[], number][] = [
      [tokens(p.name).map(norm), 5],
      [tokens(p.category).map(norm), 3],
      [tokens(`${p.summary} ${(p.sizes ?? []).map((s) => s.name).join(" ")} ${p.option?.values.join(" ") ?? ""}`).map(norm), 2],
      [tokens(`${p.description} ${fitting}`).map(norm), 1],
    ];
    let score = 0;
    let all = true;
    for (const w of want) {
      let best = 0;
      for (const [words, weight] of fields) {
        for (const x of words) {
          const hit = x === w ? 1 : x.startsWith(w) && w.length >= 3 ? 0.8 : w.length >= 4 && dist(w, x, w.length >= 7 ? 2 : 1) <= (w.length >= 7 ? 2 : 1) ? 0.6 : 0;
          best = Math.max(best, hit * weight);
        }
      }
      if (!best) all = false;
      score += best;
    }
    return { p, score, all };
  });
  // every word found first; if nothing has every word, the closest matches
  const full = scored.filter((x) => x.all);
  return (full.length ? full : scored.filter((x) => x.score >= 2)).sort((a, b) => b.score - a.score).map((x) => x.p);
}
