/*
 * EDIT-POINT: SEASONS
 * Holiday banners for the top of the shop (Dashboard > Seasonal banners).
 * Each holiday has a date rule; its banner shows from `daysBefore` days before
 * through `daysAfter` days after, when switched on. Dates that move every
 * year (Easter, Mother's Day, Thanksgiving...) are worked out here, so nothing
 * needs updating next year. To add a holiday, add a line to HOLIDAYS.
 */

export type SeasonStyle = "patriotic" | "remembrance" | "winter" | "christmas" | "newyear" | "love" | "irish" | "spring" | "summer" | "fall" | "spooky" | "thanks" | "plain";
export type SeasonSetting = {
  id: string; // a holiday's id, or "custom-..." for one of your own
  on: boolean;
  message: string;
  link: string; // "" = no button
  linkText: string;
  daysBefore: number;
  daysAfter: number;
  style: SeasonStyle;
  decor: boolean; // little drifting icons in the banner
  // your own events only
  name?: string;
  start?: string; // YYYY-MM-DD (repeats every year)
  emoji?: string;
};
export type SeasonsSettings = { on: boolean; items: SeasonSetting[] };

type Rule = (year: number) => Date;
const day = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));
/** The nth weekday of a month (n = -1 for the last). weekday 0 = Sunday. */
const nth = (n: number, weekday: number, month: number): Rule => (y) => {
  if (n > 0) {
    const first = day(y, month, 1);
    return day(y, month, 1 + ((weekday - first.getUTCDay() + 7) % 7) + (n - 1) * 7);
  }
  const last = day(y, month + 1, 0);
  return day(y, month, last.getUTCDate() - ((last.getUTCDay() - weekday + 7) % 7));
};
const fixed = (m: number, d: number): Rule => (y) => day(y, m, d);
/** Easter Sunday (Anonymous Gregorian algorithm). */
const easter: Rule = (y) => {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  return day(y, Math.floor((h + l - 7 * m + 114) / 31), ((h + l - 7 * m + 114) % 31) + 1);
};
const plus = (r: Rule, days: number): Rule => (y) => new Date(r(y).getTime() + days * 86400_000);

export type Holiday = { id: string; name: string; emoji: string; rule: Rule; defaults: Omit<SeasonSetting, "id"> };
const H = (id: string, name: string, emoji: string, rule: Rule, on: boolean, message: string, style: SeasonStyle, daysBefore: number, daysAfter = 0, link = "/shop", linkText = "Shop gifts", decor = false): Holiday => ({
  id, name, emoji, rule, defaults: { on, message, link, linkText, daysBefore, daysAfter, style, decor },
});

export const HOLIDAYS: Holiday[] = [
  H("new-year", "New Year's Day", "🎉", fixed(1, 1), false, "Happy New Year from our family to yours!", "newyear", 3, 1, "", "", true),
  H("valentines", "Valentine's Day", "❤️", fixed(2, 14), true, "Valentine's Day is coming: personalized gifts, engraved just for them.", "love", 14, 0, "/shop", "Shop gifts", true),
  H("st-patricks", "St. Patrick's Day", "☘️", fixed(3, 17), false, "Happy St. Patrick's Day!", "irish", 7, 0, "/shop", "Shop", true),
  H("easter", "Easter", "🐣", easter, false, "Happy Easter! Personalized keepsakes for the whole family.", "spring", 10, 0, "/shop", "Shop", true),
  H("mothers-day", "Mother's Day", "💐", nth(2, 0, 5), true, "Mother's Day is coming: give her something made just for her.", "spring", 14, 0, "/shop", "Shop gifts", true),
  H("armed-forces", "Armed Forces Day", "🎖️", nth(3, 6, 5), false, "Happy Armed Forces Day! Thank you to everyone who serves.", "patriotic", 3, 0, "/military", "Military discount"),
  H("memorial-day", "Memorial Day", "🇺🇸", nth(-1, 1, 5), true, "Memorial Day: remembering those who gave all.", "remembrance", 5, 0, "", ""),
  H("army-birthday", "Army Birthday & Flag Day", "⭐", fixed(6, 14), false, "Happy Birthday, U.S. Army, and happy Flag Day!", "patriotic", 2, 0, "/shop", "Shop", true),
  H("fathers-day", "Father's Day", "👔", nth(3, 0, 6), true, "Father's Day is coming: engraved gifts he'll actually use.", "summer", 14, 0, "/shop", "Shop gifts"),
  H("july-4", "Independence Day", "🎆", fixed(7, 4), true, "Happy Fourth of July! Celebrate with something red, white and blue.", "patriotic", 10, 0, "/shop", "Shop patriotic", true),
  H("labor-day", "Labor Day", "🛠️", nth(1, 1, 9), false, "Happy Labor Day to everyone who works hard to keep this country running.", "summer", 4, 0, "/shop", "Shop"),
  H("mp-corps", "Military Police Corps Birthday", "🛡️", fixed(9, 26), false, "Happy birthday to the Military Police Corps! Assist, Protect, Defend.", "patriotic", 2, 0, "/military", "Military discount"),
  H("halloween", "Halloween", "🎃", fixed(10, 31), false, "Happy Halloween!", "spooky", 10, 0, "/shop", "Shop", true),
  H("veterans-day", "Veterans Day", "🎖️", fixed(11, 11), true, "Veterans Day: thank you for your service. Ask about our military discount.", "patriotic", 10, 0, "/military", "Military discount", true),
  H("thanksgiving", "Thanksgiving", "🦃", nth(4, 4, 11), true, "Happy Thanksgiving! We're thankful for every one of you.", "thanks", 7, 0, "/shop", "Shop"),
  H("black-friday", "Black Friday to Cyber Monday", "🛍️", plus(nth(4, 4, 11), 1), true, "Black Friday through Cyber Monday: shop small and support a veteran family business!", "fall", 0, 3, "/shop", "Shop now"),
  H("christmas", "Christmas", "🎄", fixed(12, 25), true, "Christmas is coming! Order personalized gifts early so they arrive in time.", "christmas", 30, 0, "/shop", "Shop gifts", true),
];

export const STYLES: Record<SeasonStyle, { label: string; bg: string; ink: string; decor: string[] }> = {
  patriotic: { label: "Red, white & blue", bg: "linear-gradient(90deg, #0a3161, #1f4a8a 45%, #b31942)", ink: "#ffffff", decor: ["★", "★", "✦"] },
  remembrance: { label: "Remembrance (quiet)", bg: "linear-gradient(90deg, #1b1b1b, #2c2c2c)", ink: "#f1e3b3", decor: [] },
  winter: { label: "Winter", bg: "linear-gradient(90deg, #1d3a5f, #3d6e9e)", ink: "#ffffff", decor: ["❄", "❅", "❆"] },
  christmas: { label: "Christmas", bg: "linear-gradient(90deg, #14532d, #1f6e3a 50%, #9b1c1c)", ink: "#fff8e6", decor: ["❄", "✦", "❅"] },
  newyear: { label: "New Year", bg: "linear-gradient(90deg, #111827, #1e2a4a)", ink: "#f6d46b", decor: ["✦", "✧", "★"] },
  love: { label: "Valentine's", bg: "linear-gradient(90deg, #9d174d, #db2777)", ink: "#ffffff", decor: ["♥", "♡", "♥"] },
  irish: { label: "Shamrock green", bg: "linear-gradient(90deg, #14532d, #15803d)", ink: "#ffffff", decor: ["☘", "☘", "✦"] },
  spring: { label: "Spring", bg: "linear-gradient(90deg, #3f6212, #4d7c0f 50%, #854d0e)", ink: "#ffffff", decor: ["✿", "❀", "✿"] },
  summer: { label: "Summer", bg: "linear-gradient(90deg, #0e7490, #0369a1)", ink: "#ffffff", decor: ["☀", "✦"] },
  fall: { label: "Fall", bg: "linear-gradient(90deg, #7c2d12, #b45309)", ink: "#fff7ed", decor: ["🍂", "🍁"] },
  spooky: { label: "Halloween", bg: "linear-gradient(90deg, #111111, #3b1d06 50%, #9a3412)", ink: "#fed7aa", decor: ["🦇", "✦"] },
  thanks: { label: "Thanksgiving", bg: "linear-gradient(90deg, #78350f, #a16207)", ink: "#fffbeb", decor: ["🍂", "🍁"] },
  plain: { label: "Shop colors", bg: "var(--accent)", ink: "var(--accent-ink)", decor: [] },
};

export const isCustom = (id: string) => id.startsWith("custom-");

/** Every holiday with its saved settings (holidays added to the list later appear with their defaults). */
export function resolveSeasons(saved: SeasonsSettings | undefined): SeasonSetting[] {
  const items = saved?.items ?? [];
  const byId = new Map(items.map((x) => [x.id, x]));
  return [...HOLIDAYS.map((h) => ({ id: h.id, ...h.defaults, ...(byId.get(h.id) ?? {}) })), ...items.filter((x) => isCustom(x.id))];
}

/** Today's date (no time) where the shop is. */
export function shopToday(now = new Date(), tz = "America/Chicago") {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(now).split("-").map(Number);
  return day(y, m, d);
}

/** The date a holiday (or your own event) falls on in a given year. */
export function dateIn(s: SeasonSetting, year: number): Date | null {
  if (isCustom(s.id)) {
    const m = s.start?.match(/^\d{4}-(\d{2})-(\d{2})$/);
    return m ? day(year, Number(m[1]), Number(m[2])) : null;
  }
  return HOLIDAYS.find((h) => h.id === s.id)?.rule(year) ?? null;
}

/** When it next shows: the window around this year's date, or next year's if this year's has passed. */
export function nextWindow(s: SeasonSetting, today = shopToday()) {
  for (const y of [today.getUTCFullYear() - 1, today.getUTCFullYear(), today.getUTCFullYear() + 1]) {
    const d = dateIn(s, y);
    if (!d) return null;
    const from = new Date(d.getTime() - Math.max(0, s.daysBefore) * 86400_000);
    const to = new Date(d.getTime() + Math.max(0, s.daysAfter) * 86400_000);
    if (to >= today) return { date: d, from, to, now: from <= today };
  }
  return null;
}

/** The banner to show right now, if any: of those on and in their window, the one whose day is soonest. */
export function activeSeason(all: SeasonsSettings | undefined, today = shopToday()) {
  if (!all?.on) return null;
  const live = resolveSeasons(all)
    .filter((s) => s.on && s.message.trim())
    .map((s) => ({ s, w: nextWindow(s, today) }))
    .filter((x) => x.w?.now)
    .sort((a, b) => a.w!.date.getTime() - b.w!.date.getTime());
  return live[0] ? live[0].s : null;
}

export const seasonEmoji = (s: SeasonSetting) => (isCustom(s.id) ? s.emoji || "✦" : HOLIDAYS.find((h) => h.id === s.id)?.emoji ?? "✦");
export const seasonName = (s: SeasonSetting) => (isCustom(s.id) ? s.name || "Your event" : HOLIDAYS.find((h) => h.id === s.id)?.name ?? s.id);
