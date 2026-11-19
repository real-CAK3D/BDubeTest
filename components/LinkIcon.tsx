/*
 * EDIT-POINT: LINK-ICONS
 * The little pictures for links (footer, contact page). To add one, add an
 * entry here: a name, a color, and a drawing on a 24x24 grid.
 */
type Icon = { name: string; color: string; draw: React.ReactNode; prefix?: string; placeholder: string };

const letter = (t: string, size = 13) => (
  <text x="12" y="16.5" textAnchor="middle" fontSize={size} fontWeight="800" fontFamily="Arial, Helvetica, sans-serif" fill="currentColor">
    {t}
  </text>
);
const line = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const LINK_ICONS: Record<string, Icon> = {
  facebook: { name: "Facebook", color: "#1877F2", draw: letter("f", 17), placeholder: "https://www.facebook.com/..." },
  instagram: { name: "Instagram", color: "#C13584", draw: <g {...line}><rect x="4" y="4" width="16" height="16" rx="5" /><circle cx="12" cy="12" r="3.6" /><circle cx="17" cy="7" r="0.6" fill="currentColor" /></g>, placeholder: "https://www.instagram.com/..." },
  tiktok: { name: "TikTok", color: "#111111", draw: <path {...line} d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5M14 4c.5 2.5 2.2 4 4.5 4.2" />, placeholder: "https://www.tiktok.com/@..." },
  youtube: { name: "YouTube", color: "#FF0000", draw: <g><rect x="3" y="6" width="18" height="12" rx="4" fill="currentColor" /><path d="M10.5 9.5v5l4.5-2.5z" fill="#fff" /></g>, placeholder: "https://www.youtube.com/@..." },
  x: { name: "X", color: "#111111", draw: <path {...line} d="M5 5l14 14M19 5L5 19" />, placeholder: "https://x.com/..." },
  pinterest: { name: "Pinterest", color: "#E60023", draw: letter("P", 15), placeholder: "https://www.pinterest.com/..." },
  etsy: { name: "Etsy", color: "#F1641E", draw: letter("E", 15), placeholder: "https://www.etsy.com/shop/..." },
  google: { name: "Google", color: "#4285F4", draw: letter("G", 15), placeholder: "Your Google Business / reviews link" },
  whatsapp: { name: "WhatsApp", color: "#25D366", draw: <g {...line}><path d="M4.5 19.5l1.2-3.6A8 8 0 1 1 8.5 18.6z" /><path d="M9.3 9.2c.3 2.3 2.3 4.4 4.7 4.9l1-1.1 1.6.8" /></g>, placeholder: "https://wa.me/1555..." },
  linkedin: { name: "LinkedIn", color: "#0A66C2", draw: letter("in", 11), placeholder: "https://www.linkedin.com/in/..." },
  threads: { name: "Threads", color: "#111111", draw: letter("@", 15), placeholder: "https://www.threads.net/@..." },
  snapchat: { name: "Snapchat", color: "#E5C600", draw: <path {...line} d="M12 4c3 0 4.5 2.2 4.5 5v2l2 .8-2 1.2c.5 1.8 1.8 2.6 3 3-1.5.6-3 .5-3.5 1.5-1.3-.5-2.5.5-4 .5s-2.7-1-4-.5c-.5-1-2-.9-3.5-1.5 1.2-.4 2.5-1.2 3-3l-2-1.2 2-.8V9c0-2.8 1.5-5 4.5-5z" />, placeholder: "https://www.snapchat.com/add/..." },
  amazon: { name: "Amazon", color: "#FF9900", draw: <g {...line}><path d="M5 9h14l-1.2 10H6.2z" /><path d="M9 9V7a3 3 0 0 1 6 0v2" /></g>, placeholder: "Your Amazon store link" },
  phone: { name: "Call", color: "#2E7D32", prefix: "tel:", draw: <path {...line} d="M6 4h3l1.5 4-2 1.3a10 10 0 0 0 6.2 6.2L16 13.5l4 1.5v3a2 2 0 0 1-2 2A15 15 0 0 1 4 6a2 2 0 0 1 2-2z" />, placeholder: "Phone number, e.g. 580-555-0100" },
  text: { name: "Text", color: "#34A853", prefix: "sms:", draw: <g {...line}><path d="M4 5h16v11H9l-4 3.5V16H4z" /><path d="M8 9.5h8M8 12.5h5" /></g>, placeholder: "Phone number for texts" },
  email: { name: "Email", color: "#5F6368", prefix: "mailto:", draw: <g {...line}><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="M4 7l8 6 8-6" /></g>, placeholder: "you@example.com" },
  website: { name: "Website", color: "#455A64", draw: <g {...line}><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.5 2.5 2.5 14.5 0 17M12 3.5c-2.5 2.5-2.5 14.5 0 17" /></g>, placeholder: "https://..." },
  map: { name: "Directions", color: "#D93025", draw: <g {...line}><path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></g>, placeholder: "A Google Maps link" },
  reviews: { name: "Reviews", color: "#F9A825", draw: <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8 6.8 19.6l1-5.8-4.3-4.1 5.9-.8z" fill="currentColor" />, placeholder: "https://..." },
  link: { name: "Link", color: "#546E7A", draw: <g {...line}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></g>, placeholder: "https://..." },
};

/** Turn what the owner typed into a working address (phone numbers, emails, plain web addresses). */
export function linkHref(icon: string, value: string) {
  const v = value.trim();
  if (/^(https?:|mailto:|tel:|sms:)/i.test(v)) return v;
  const pre = LINK_ICONS[icon]?.prefix;
  if (pre === "tel:" || pre === "sms:") return pre + v.replace(/[^\d+]/g, "");
  if (pre === "mailto:") return pre + v;
  if (v.startsWith("/")) return v;
  return v ? `https://${v.replace(/^\/+/, "")}` : "";
}

export function LinkIcon({ icon, size = 22, colored = true }: { icon: string; size?: number; colored?: boolean }) {
  const i = LINK_ICONS[icon] ?? LINK_ICONS.link;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={colored ? { color: i.color } : undefined}>
      {i.draw}
    </svg>
  );
}

// brand backgrounds for the badges (a solid color unless listed here)
const BADGE_BG: Record<string, string> = {
  instagram: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285aeb 90%)",
  tiktok: "linear-gradient(135deg, #25f4ee 0%, #111 35%, #111 65%, #fe2c55 100%)",
  google: "conic-gradient(from -45deg, #ea4335 0 25%, #4285f4 0 50%, #34a853 0 75%, #fbbc05 0 100%)",
};

/** A modern app-style badge: the brand's color with a white icon. */
export function LinkBadge({ icon, size = 44 }: { icon: string; size?: number }) {
  const i = LINK_ICONS[icon] ?? LINK_ICONS.link;
  const dark = icon === "snapchat";
  return (
    <span className="link-badge" style={{ width: size, height: size, background: BADGE_BG[icon] ?? i.color, color: dark ? "#111" : "#fff" }} aria-hidden>
      <svg width={Math.round(size * 0.58)} height={Math.round(size * 0.58)} viewBox="0 0 24 24">
        {i.draw}
      </svg>
    </span>
  );
}
