import type { Faq } from "./types";

/*
 * EDIT-POINT: CHAT-BRAIN
 * How the chat answers with no AI key. No outside service, nothing to pay for.
 *
 *  1. Cleans up the question: fixes typos against the shop's own words,
 *     treats "shipping/shipped/ship" and "cup/tumbler/stanley" as the same.
 *  2. Answers straight from the shop's data when it can: prices and sizes of
 *     an item, whether something is sold, stock, shipping, pickup, discounts,
 *     gift cards, contact details, order status.
 *  3. Otherwise finds the owner's closest written answer (BM25 ranking over
 *     the question, its "other ways to ask", then the answer itself).
 *  4. Remembers the item being talked about, so "how much is it?" works.
 *  5. Splits two questions in one message and answers both.
 *
 * Everything here is plain code: same question, same answer, nothing made up.
 */

export type BrainProduct = { name: string; slug: string; category: string; summary: string; price: number; sizes: { name: string; price: number }[]; stock: number | null; madeToOrder: boolean };
export type BrainShop = {
  business: string;
  products: BrainProduct[];
  freeShippingOver: number; // cents, 0 = never
  localPickup: boolean;
  pickupNote: string;
  customOrders: boolean;
  customOrderNotice: string;
  bulk: { minQty: number; percent: number }[];
  veteran: { on: boolean; percent: number };
  thankYou: { on: boolean; percent: number };
  giftCards: { on: boolean; amounts: number[] };
  email: string;
  phone: string;
  location: string;
  facebook: boolean;
};
export type BrainTurn = { role: "user" | "assistant"; content: string };
export type BrainReply = { reply: string; answered: boolean; faq?: string };

const money = (c: number) => `$${(c / 100).toFixed(c % 100 ? 2 : 0)}`;
const list = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ---------- words ----------

const STOP = new Set(
  "a an the is are am was were be been do does did can could would will shall should may might must i im ive you your yours my me mine we our ours us it its of to for in on at by with and or but how what whats when where which who why if this that these those there here have has had get got any some about from into just also really very please thanks thank hi hello hey so too than then them they their one ones".split(" ")
);
// words that mean the same thing to this shop (after stemming)
const SAME: Record<string, string> = {
  shipping: "ship", shipped: "ship", deliver: "ship", delivery: "ship", deliveri: "ship", mail: "ship", post: "ship", send: "ship", sent: "ship", arrive: "ship", arriv: "ship", state: "ship", stat: "ship", anywhere: "ship", nationwide: "ship",
  cost: "price", costs: "price", much: "price", charge: "price", fee: "price", pric: "price", expensive: "price", cheap: "price", dollar: "price",
  cup: "tumbler", mug: "tumbler", stanley: "tumbler", yeti: "tumbler", bottl: "tumbler", bottle: "tumbler", drinkware: "tumbler",
  laser: "engrave", engrav: "engrave", etch: "engrave", personaliz: "engrave", personalis: "engrave", put: "engrave", print: "engrave", custom: "custom", customiz: "custom",
  refund: "return", exchang: "return", exchange: "return", broken: "return", damag: "return", damaged: "return",
  coupon: "code", promo: "code", voucher: "code", discount: "discount", sale: "discount", deal: "discount", off: "discount",
  vet: "military", veteran: "military", army: "military", navy: "military", marine: "military", airman: "military", soldier: "military", police: "military", firefight: "military", firefighter: "military", ems: "military", nurs: "military", respond: "military", servic: "military",
  pick: "pickup", local: "pickup", collect: "pickup",
  track: "track", tracking: "track", status: "track", where: "track",
  long: "time", fast: "time", soon: "time", quick: "time", quickly: "time", day: "time", week: "time", wait: "time", rush: "time",
  logo: "logo", company: "business", work: "business", team: "business",
  image: "picture", photo: "picture", pic: "picture", art: "picture", artwork: "picture", design: "design",
  canada: "outside", mexico: "outside", international: "outside", internation: "outside", overseas: "outside", abroad: "outside", country: "outside", countri: "outside", worldwid: "outside", worldwide: "outside", uk: "outside", europe: "outside",
  wash: "care", clean: "care", dishwasher: "care", dishwash: "care", care: "care", maintain: "care", scratch: "care",
  sign: "sign", plaque: "sign", wood: "wood", wooden: "wood",
  pay: "pay", paypal: "pay", card: "pay", venmo: "pay", cash: "pay", apple: "pay", google: "pay", klarna: "pay", afterpay: "pay",
  gift: "gift", present: "gift",
  stock: "stock", avail: "stock", available: "stock", sold: "stock", left: "stock",
  big: "size", bigger: "size", small: "size", smaller: "size", oz: "size", ounce: "size", inch: "size", size: "size", larg: "size", large: "size",
  bulk: "bulk", wholesal: "bulk", wholesale: "bulk", order: "order", lot: "bulk", many: "bulk", dozen: "bulk", quantity: "bulk",
};

/** A light stemmer: "engraving" -> "engrav", "tumblers" -> "tumbler". */
function stem(w: string) {
  if (w.length <= 3) return w;
  return w
    .replace(/'s$/, "")
    .replace(/(ies)$/, "y")
    .replace(/(ing|edly|ed|ers|er|es|ly|s)$/, "")
    .replace(/(.)\1$/, "$1");
}

function tokens(s: string) {
  return s
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/\b(can't|cannot)\b/g, "can not")
    .replace(/n't\b/g, " not")
    .replace(/[^a-z0-9'\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function norm(w: string) {
  if (SAME[w]) return SAME[w];
  const st = stem(w);
  return SAME[st] ?? st;
}

/** Edit distance with swaps (Damerau), stopping early past the limit. */
function dist(a: string, b: string, max: number) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let best = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const c = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      best = Math.min(best, d[i][j]);
    }
    if (best > max) return max + 1;
  }
  return d[a.length][b.length];
}

// ---------- the index (built once per set of answers and items) ----------

type Doc = { faq: Faq; q: string[]; alts: string[]; a: string[] };
type Index = { docs: Doc[]; vocab: Set<string>; df: Map<string, number>; avg: number; key: string };
let cached: Index | null = null;

function indexOf(faqs: Faq[], shop: BrainShop): Index {
  const key = JSON.stringify([faqs.map((f) => [f.id, f.q, f.a, f.alts, f.hidden]), shop.products.map((p) => p.name)]);
  if (cached?.key === key) return cached;
  const words = (s: string) => tokens(s).filter((w) => !STOP.has(w)).map(norm).filter((w) => w.length > 1);
  const docs = faqs.filter((f) => !f.hidden && f.a.trim()).map((f) => ({ faq: f, q: words(f.q), alts: (f.alts ?? []).flatMap(words), a: words(f.a) }));
  const df = new Map<string, number>();
  for (const d of docs) for (const w of new Set([...d.q, ...d.alts])) df.set(w, (df.get(w) ?? 0) + 1);
  const vocab = new Set<string>();
  // the raw words customers might misspell: from answers, items and the synonyms list
  const raw = [...faqs.flatMap((f) => [f.q, f.a, ...(f.alts ?? [])]), ...shop.products.flatMap((p) => [p.name, p.category]), Object.keys(SAME).join(" ")].join(" ");
  for (const w of tokens(raw)) if (w.length > 3 && !/\d/.test(w)) vocab.add(w);
  for (const w of Object.values(SAME)) vocab.add(w);
  const avg = docs.reduce((n, d) => n + d.q.length + d.alts.length, 0) / Math.max(1, docs.length);
  cached = { docs, vocab, df, avg, key };
  return cached;
}

/** "shiping" -> "shipping", "tumblr" -> "tumbler" (only for words the shop actually uses). */
function spellFix(w: string, vocab: Set<string>) {
  if (w.length < 5 || STOP.has(w) || /\d/.test(w) || vocab.has(w) || SAME[w] || SAME[stem(w)]) return w;
  const max = w.length > 7 ? 2 : 1;
  let best = w;
  let bestD = max + 1;
  for (const v of vocab) {
    if (Math.abs(v.length - w.length) > max || v[0] !== w[0]) continue;
    const d = dist(w, v, max);
    if (d < bestD) [best, bestD] = [v, d];
  }
  return best;
}

function understand(text: string, idx: Index) {
  const raw = tokens(text).map((w) => spellFix(w, idx.vocab));
  return { raw, words: [...new Set(raw.filter((w) => !STOP.has(w)).map(norm).filter((w) => w.length > 1))] };
}

// ---------- the owner's written answers (BM25) ----------

export function rankAnswers(words: string[], idx: Index) {
  const N = idx.docs.length;
  const idf = (w: string) => Math.log(1 + (N - (idx.df.get(w) ?? 0) + 0.5) / ((idx.df.get(w) ?? 0) + 0.5));
  const k1 = 1.2;
  const b = 0.6;
  const bm = (terms: string[], len: number, w: string) => {
    const tf = terms.filter((t) => t === w).length;
    return tf ? (tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * len) / Math.max(1, idx.avg))) : 0;
  };
  const ideal = words.reduce((n, w) => n + idf(w) * (k1 + 1), 0) || 1;
  return idx.docs
    .map((d) => {
      const qs = [...d.q, ...d.alts];
      let s = 0;
      for (const w of words) s += idf(w) * Math.max(bm(qs, qs.length, w), 0.35 * bm(d.a, d.a.length, w));
      // how much of the written question the customer covered (stops one shared word winning)
      const cover = d.q.length ? d.q.filter((w) => words.includes(w)).length / d.q.length : 0;
      return { faq: d.faq, score: Math.min(1, (s / ideal) * 0.75 + cover * 0.35) };
    })
    .filter((m) => m.score > 0.05)
    .sort((x, y) => y.score - x.score);
}

// ---------- the shop's own data ----------

export function findProducts(raw: string[], shop: BrainShop) {
  const said = ` ${raw.join(" ")} `;
  const plain = (s: string) => tokens(s).filter((w) => !STOP.has(w)).map(norm);
  const mine = new Set(plain(raw.join(" ")));
  // words many items share ("tumbler", "custom") count for little; a word that names one item counts fully
  const generic = new Set(["tumbler", "engrave", "custom", "size", "sign", "wood", "design", "gift", "set"].map(norm));
  const scored = shop.products
    .map((p) => {
      const name = [...new Set(plain(p.name))];
      const score = name.reduce((n, w) => n + (mine.has(w) ? (generic.has(w) ? 0.3 : 1) : 0), 0);
      const cat = p.category && said.includes(` ${p.category.toLowerCase()} `) ? 0.5 : 0;
      const sizeHit = p.sizes.some((z) => said.includes(` ${z.name.toLowerCase().replace(/\s+/g, " ")} `) || said.includes(` ${z.name.toLowerCase().replace(/\s+/g, "")} `)) ? 0.6 : 0;
      return { p, score: score + cat + (score ? sizeHit : 0) };
    })
    .filter((m) => m.score >= 0.9)
    .sort((a, b) => b.score - a.score);
  // keep only the clear front-runners
  return scored.filter((m) => m.score >= scored[0]?.score * 0.8).map((m) => m.p);
}

/** Items sharing any word with the question ("do you sell tumblers?"). */
function looseProducts(raw: string[], shop: BrainShop) {
  const plain = (s: string) => tokens(s).filter((w) => !STOP.has(w)).map(norm);
  const mine = new Set(plain(raw.join(" ")));
  return shop.products.filter((p) => plain(`${p.name} ${p.category}`).some((w) => mine.has(w) && w.length > 2 && !["price", "stock", "size"].includes(w)));
}

function about(p: BrainProduct, want: Set<string>) {
  const lines: string[] = [];
  const sizes = p.sizes.filter((z) => z.name);
  const priced = sizes.length
    ? sizes.every((z) => !z.price)
      ? `comes in ${list(sizes.map((z) => z.name))}; you'll see the price for each size on its page`
      : `comes in ${list(sizes.map((z) => (z.price ? `${z.name} (${money(z.price)})` : z.name)))}`
    : p.price
      ? `is ${money(p.price)}`
      : "is priced by what you choose; the item page shows the price before you add it to your cart";
  const stockOnly = (want.has("stock") || want.has("time")) && !want.has("price");
  if (!stockOnly) lines.push(`The ${p.name} ${priced}.`);
  if (want.has("stock") || want.has("time")) {
    if (p.stock === 0) lines.push("It's sold out right now; send us a message and we'll tell you when it's back.");
    else if (p.madeToOrder || p.stock === null) lines.push(`The ${p.name} is made to order for you, so it's always available.`);
    else lines.push(p.stock <= 3 ? `Only ${p.stock} ${p.name} left.` : `Yes, the ${p.name} is in stock.`);
  } else if (p.stock === 0) lines.push("It's sold out at the moment.");
  if (!want.has("price") && !stockOnly && p.summary) lines.push(p.summary.replace(/\.?$/, "."));
  lines.push(`More details: /product/${p.slug}`);
  return lines.join(" ");
}

type Topic = { test: (w: Set<string>, raw: string[]) => boolean; say: (s: BrainShop) => string | null };
const has = (w: Set<string>, ...xs: string[]) => xs.some((x) => w.has(x));
// answers built from the shop's settings, so they're always up to date
const TOPICS: Topic[] = [
  {
    test: (w) => has(w, "ship") && has(w, "price"),
    say: (s) => `Shipping is worked out from your ZIP code in the cart, so you'll see the exact price before you pay.${s.freeShippingOver ? ` Orders over ${money(s.freeShippingOver)} ship free.` : ""}${s.localPickup ? " Local pickup is free too." : ""}`,
  },
  {
    test: (w, raw) => has(w, "ship") && !has(w, "time", "track", "return") && !has(w, "outside"),
    say: (s) => `Yes, we ship anywhere in the US. The cart works out the shipping price from your ZIP code before you pay.${s.freeShippingOver ? ` Orders over ${money(s.freeShippingOver)} ship free.` : ""}${s.localPickup ? " Local pickup is free too." : ""}`,
  },
  { test: (w) => has(w, "pickup"), say: (s) => (s.localPickup ? `Yes, local pickup is free. Choose it in the cart. ${s.pickupNote}`.trim() : null) },
  { test: (w, raw) => has(w, "bulk") || (raw.some((x) => Number(x) >= 3 && Number(x) < 10000) && raw.some((x) => ["buy", "order", "get", "need", "want"].includes(x))), say: (s) => (s.bulk.length ? `Yes! Bigger orders get money off automatically in the cart: ${list(s.bulk.map((t) => `${t.minQty}+ items get ${t.percent}% off`))}. For a big custom job, use the Custom orders page: /custom-order` : null) },
  { test: (w) => has(w, "military"), say: (s) => (s.veteran.on ? `Thank you for your service! Military, veterans and first responders get ${s.veteran.percent}% off. Ask for your code here: /military` : null) },
  { test: (w) => has(w, "gift") && !has(w, "wrap"), say: (s) => (s.giftCards.on ? `Yes, we have gift cards: ${list(s.giftCards.amounts.map((a) => `$${a}`))}. They're emailed with your message: /gift-cards` : null) },
  {
    test: (w) => has(w, "discount", "code"),
    say: (s) => {
      const bits = [s.veteran.on ? `${s.veteran.percent}% off for military, veterans and first responders (/military)` : "", s.bulk.length ? `automatic bulk savings from ${s.bulk[0].minQty} items` : "", s.thankYou.on ? `a thank-you code for ${s.thankYou.percent}% off your next order after you buy` : ""].filter(Boolean);
      return bits.length ? `Here's what we offer: ${list(bits)}. If you have a code, type it on the checkout page.` : "If you have a code, type it on the checkout page.";
    },
  },
  { test: (w, raw) => has(w, "track") && (raw.includes("order") || raw.includes("package") || raw.includes("my")), say: () => "You can check your order any time on the Order status page with your order number (or the code on your receipt) and your email: /order-status. You'll also get an email with tracking once it ships." },
  {
    test: (w) => has(w, "custom", "logo", "picture") && !has(w, "care"),
    say: (s) => (s.customOrders ? `Yes, we love custom work! Tell us what you have in mind on the Custom orders page and we'll get back to you with a price: /custom-order${s.customOrderNotice ? ` ${s.customOrderNotice}` : ""}` : null),
  },
  { test: (w, raw) => raw.some((x) => ["contact", "email", "phone", "call", "reach", "talk", "human", "person", "someone", "owner"].includes(x)), say: (s) => `You can reach us ${list([s.email ? `by email at ${s.email}` : "", s.phone ? `by phone at ${s.phone}` : "", "through the Contact page (/contact)", s.facebook ? "on our Facebook page" : ""].filter(Boolean))}.` },
  { test: (w, raw) => raw.some((x) => ["located", "location", "based", "address", "city"].includes(x)), say: (s) => (s.location ? `We're based in ${s.location}.${s.localPickup ? " Local pickup is free." : ""}` : null) },
  { test: (w) => has(w, "pay"), say: () => "We take all major cards, Apple Pay and Google Pay, through a secure Stripe checkout." },
];

const SMALL: [RegExp, (s: BrainShop) => string][] = [
  [/^(hi|hello|hey|howdy|good (morning|afternoon|evening)|yo|sup)\b[\s!.]*$/i, (s) => `Hi there! Welcome to ${s.business}. What can I help you with?`],
  [/^(thanks|thank you|thx|ty|appreciate it|great|awesome|perfect|ok(ay)?|cool)\b.*$/i, () => "You're welcome! Anything else I can help with?"],
  [/^(bye|goodbye|see ya|later)\b/i, () => "Thanks for stopping by! Have a great day."],
  [/\b(who are you|are you (a )?(bot|robot|human|real|ai))\b/i, (s) => `I'm the ${s.business} chat helper. I answer from the shop's own info; for anything else a real person answers on the Contact page.`],
];

// ---------- putting it together ----------

function one(text: string, idx: Index, shop: BrainShop, context: BrainProduct | null) {
  for (const [re, say] of SMALL) if (re.test(text.trim())) return { reply: say(shop), answered: true, product: context };
  const { raw, words } = understand(text, idx);
  const w = new Set(words);
  const ranked = rankAnswers(words, idx);
  const best = ranked[0];

  // an item by name, or "it"/"that one" meaning the last item talked about
  let items = findProducts(raw, shop);
  const pointing = raw.some((x) => ["it", "that", "this", "one", "them", "those"].includes(x));
  if (!items.length && pointing && context) items = [context];
  const asksSell = raw.some((x) => ["sell", "carry", "offer", "stock", "got"].includes(x)) || /\b(do|does) (you|y'?all|u) (have|make)\b/.test(raw.join(" "));
  const productish = has(w, "price", "stock", "size") || asksSell;
  const aboutItems = (ps: BrainProduct[]) => {
    if (ps.length > 3 && !has(w, "price")) return { reply: `We have ${ps.length} that match: ${list(ps.slice(0, 6).map((p) => p.name))}. Which one would you like to know about?`, answered: true, product: null };
    return { reply: ps.slice(0, 2).map((p) => about(p, w)).join("\n\n"), answered: true, product: ps[0] };
  };
  if (items.length && productish) return aboutItems(items);

  // a strong written answer wins; then the shop's own facts; then the item they named; then a weaker written answer
  if (best && best.score >= 0.55) return { reply: best.faq.a, answered: true, faq: best.faq.id, product: context };
  for (const t of TOPICS) {
    if (!t.test(w, raw)) continue;
    const said = t.say(shop);
    if (said) return { reply: said, answered: true, product: context };
  }
  if (items.length && (!best || best.score < 0.45)) return aboutItems(items);
  if (best && best.score >= 0.32) return { reply: best.faq.a, answered: true, faq: best.faq.id, product: context };

  // "do you sell tumblers?" (a kind of item) or "do you sell candles?" (not listed)
  if ((asksSell || productish) && words.length) {
    const loose = looseProducts(raw, shop);
    if (loose.length) return aboutItems(loose);
    if (shop.customOrders) return { reply: "I don't see that in the shop right now, but we do a lot of custom work. Tell us what you're after on the Custom orders page and we'll let you know: /custom-order", answered: false, product: context };
  }
  const maybe = ranked.slice(0, 2).filter((m) => m.score > 0.2);
  if (maybe.length) return { reply: `I'm not completely sure what you mean. Were you asking one of these?\n• ${maybe.map((m) => m.faq.q).join("\n• ")}\n\nOr send us a message on the Contact page (/contact) and we'll answer personally.`, answered: false, product: context };
  return { reply: "I'm not sure about that one. Send us a message on the Contact page (/contact) and we'll get back to you.", answered: false, product: context };
}

/** Reply to the last message, using the conversation for "it" and "that one". */
export function think(history: BrainTurn[], faqs: Faq[], shop: BrainShop): BrainReply {
  const idx = indexOf(faqs, shop);
  const question = history.at(-1)?.content ?? "";
  // the last item mentioned earlier in the conversation
  let context: BrainProduct | null = null;
  for (const t of history.slice(0, -1)) {
    const found = findProducts(understand(t.content, idx).raw, shop);
    if (found.length === 1) context = found[0];
  }
  // two questions in one message get two answers
  const parts = question
    .split(/\?+|\balso\b|\band (?=(?:do|does|can|how|what|is|are|will|when|where)\b)/i)
    .map((x) => x.trim())
    .filter((x) => x.split(/\s+/).length >= 2 || SMALL.some(([re]) => re.test(x)))
    .slice(0, 3);
  if (parts.length < 2) {
    const r = one(question, idx, shop, context);
    return { reply: r.reply, answered: r.answered, faq: r.faq };
  }
  const out: string[] = [];
  let answered = true;
  let faq: string | undefined;
  for (const p of parts) {
    const r = one(p, idx, shop, context);
    if (r.product) context = r.product;
    if (!out.includes(r.reply)) out.push(r.reply);
    answered &&= r.answered;
    faq ??= r.faq;
  }
  return { reply: out.map((r, i) => (i ? cap(r) : r)).join("\n\n"), answered, faq };
}
