import type { LinkItem } from "./types";

/*
 * EDIT-POINT: LINK-PAGE
 * The Socials page (/socials): a link-in-bio page like Linktree. Put its
 * address in the bio on Instagram, TikTok, Facebook... and everything is one
 * tap away. Set up under Dashboard > Link page. The links themselves are the
 * same list as the footer and contact page (Words & logos > Contact page).
 */

export type LinkPageSettings = {
  title: string; // big name under the picture ("" = the business name)
  handle: string; // e.g. @dubefamilycreations ("" = none)
  bio: string; // a line or two ("" = the tagline)
  avatar: string; // round picture ("" = the logo)
  bg: "theme" | "color" | "gradient" | "image";
  color1: string; // background color (and the top of a gradient)
  color2: string; // the bottom of a gradient
  image: string; // background photo
  button: "fill" | "outline" | "soft" | "shadow" | "glass";
  shape: "pill" | "round" | "square";
  btnColor: string; // "" = the theme's button color
  btnText: string; // "" = worked out from the button color
  textColor: string; // name, bio and icons ("" = worked out from the background)
  iconsAt: "top" | "bottom"; // where the row of social icons sits
  shopButton: boolean; // a highlighted "Shop" button at the top of the list
  share: boolean; // the share button (copy link, QR code, post to...)
  subscribe: boolean; // the email sign-up box
  footer: string; // small line at the very bottom ("" = the business name)
};

export const DEFAULT_LINK_PAGE: LinkPageSettings = {
  title: "",
  handle: "",
  bio: "",
  avatar: "",
  bg: "theme",
  color1: "#1f2a44",
  color2: "#7a2e3a",
  image: "",
  button: "fill",
  shape: "pill",
  btnColor: "",
  btnText: "",
  textColor: "",
  iconsAt: "top",
  shopButton: true,
  share: true,
  subscribe: false,
  footer: "",
};

// social networks: shown as a small icon at the top and as a button, unless changed
export const SOCIAL_NETWORKS = ["facebook", "instagram", "tiktok", "youtube", "x", "pinterest", "linkedin", "threads", "snapchat", "whatsapp", "discord", "reddit", "spotify", "twitch", "telegram", "github", "messenger", "etsy"];

/** Where a link shows on the Socials page: as a big button, a small icon at the top, or both. */
export function placeOf(l: LinkItem): "button" | "icon" | "both" {
  return l.place ?? (SOCIAL_NETWORKS.includes(l.icon) ? "both" : "button");
}

export function cleanLinkPage(v: unknown): LinkPageSettings {
  const z = (v ?? {}) as Record<string, unknown>;
  const s = (k: string, n: number) => String(z[k] ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);
  const pick = <T extends string>(k: string, ok: readonly T[], d: T) => (ok.includes(z[k] as T) ? (z[k] as T) : d);
  const color = (k: string, d: string) => (/^#[0-9a-f]{6}$/i.test(String(z[k])) ? String(z[k]) : d);
  const url = (k: string) => (/^(https:\/\/|\/)/.test(s(k, 500)) ? s(k, 500) : "");
  const D = DEFAULT_LINK_PAGE;
  return {
    title: s("title", 60),
    handle: s("handle", 40),
    bio: s("bio", 300),
    avatar: url("avatar"),
    bg: pick("bg", ["theme", "color", "gradient", "image"], D.bg),
    color1: color("color1", D.color1),
    color2: color("color2", D.color2),
    image: url("image"),
    button: pick("button", ["fill", "outline", "soft", "shadow", "glass"], D.button),
    shape: pick("shape", ["pill", "round", "square"], D.shape),
    btnColor: color("btnColor", ""),
    btnText: color("btnText", ""),
    textColor: color("textColor", ""),
    iconsAt: pick("iconsAt", ["top", "bottom"], D.iconsAt),
    shopButton: z.shopButton !== false,
    share: z.share !== false,
    subscribe: Boolean(z.subscribe),
    footer: s("footer", 80),
  };
}

/** Black or white text, whichever reads better on a color. */
export function inkOn(hex: string) {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return "#ffffff";
  const [r, g, b] = m.slice(1).map((x) => {
    const c = parseInt(x, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? "#111111" : "#ffffff";
}
