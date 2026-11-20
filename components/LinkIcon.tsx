/*
 * EDIT-POINT: LINK-ICONS
 * The little pictures for links (footer, contact page). To add one, add an
 * entry here: a name, a color, and a drawing on a 24x24 grid.
 */
type Icon = { name: string; color: string; draw: React.ReactNode; prefix?: string; placeholder: string; file?: string }; // file: an icon from public/icons/social (see CREDITS.md)

const letter = (t: string, size = 13) => (
  <text x="12" y="16.5" textAnchor="middle" fontSize={size} fontWeight="800" fontFamily="Arial, Helvetica, sans-serif" fill="currentColor">
    {t}
  </text>
);
const line = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const LINK_ICONS: Record<string, Icon> = {
  facebook: { name: "Facebook", color: "#1877F2", draw: letter("f", 17), file: "facebook", placeholder: "https://www.facebook.com/..." },
  instagram: { name: "Instagram", color: "#C13584", draw: <g {...line}><rect x="4" y="4" width="16" height="16" rx="5" /><circle cx="12" cy="12" r="3.6" /><circle cx="17" cy="7" r="0.6" fill="currentColor" /></g>, file: "instagram", placeholder: "https://www.instagram.com/..." },
  tiktok: { name: "TikTok", color: "#111111", draw: <path {...line} d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5M14 4c.5 2.5 2.2 4 4.5 4.2" />, file: "tiktok", placeholder: "https://www.tiktok.com/@..." },
  youtube: { name: "YouTube", color: "#FF0000", draw: <g><rect x="3" y="6" width="18" height="12" rx="4" fill="currentColor" /><path d="M10.5 9.5v5l4.5-2.5z" fill="#fff" /></g>, file: "youtube", placeholder: "https://www.youtube.com/@..." },
  x: { name: "X", color: "#111111", draw: <path {...line} d="M5 5l14 14M19 5L5 19" />, file: "twitter-x", placeholder: "https://x.com/..." },
  pinterest: { name: "Pinterest", color: "#E60023", draw: letter("P", 15), file: "pinterest", placeholder: "https://www.pinterest.com/..." },
  etsy: { name: "Etsy", color: "#F1641E", draw: <path fill="currentColor" d="M8.559 2.445c0-.325.033-.52.59-.52h7.465c1.3 0 2.02 1.11 2.54 3.193l.42 1.666h1.27c.23-4.728.43-6.784.43-6.784s-3.196.36-5.09.36H6.635L1.521.196v1.37l1.725.326c1.21.24 1.5.496 1.6 1.606 0 0 .11 3.27.11 8.64 0 5.385-.09 8.61-.09 8.61 0 .973-.39 1.333-1.59 1.573l-1.722.33V24l5.13-.165h8.55c1.935 0 6.39.165 6.39.165.105-1.17.75-6.48.855-7.064h-1.2l-1.284 2.91c-1.005 2.28-2.476 2.445-4.11 2.445h-4.906c-1.63 0-2.415-.64-2.415-2.05V12.8s3.62 0 4.79.096c.912.064 1.463.325 1.76 1.598l.39 1.695h1.41l-.09-4.278.192-4.305h-1.391l-.45 1.89c-.283 1.244-.48 1.47-1.754 1.6-1.666.17-4.815.14-4.815.14V2.45h-.05z" />, placeholder: "https://www.etsy.com/shop/..." },
  google: { name: "Google", color: "#4285F4", draw: <path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />, placeholder: "Your Google Business / reviews link" },
  whatsapp: { name: "WhatsApp", color: "#25D366", draw: <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />, placeholder: "https://wa.me/1555..." },
  linkedin: { name: "LinkedIn", color: "#0A66C2", draw: letter("in", 11), file: "linkedin", placeholder: "https://www.linkedin.com/in/..." },
  threads: { name: "Threads", color: "#111111", draw: <path fill="currentColor" d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z" />, placeholder: "https://www.threads.net/@..." },
  snapchat: { name: "Snapchat", color: "#E5C600", draw: <path fill="currentColor" d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z" />, placeholder: "https://www.snapchat.com/add/..." },
  amazon: { name: "Amazon", color: "#FF9900", draw: <path fill="currentColor" d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726a17.617 17.617 0 01-10.951-.577 17.88 17.88 0 01-5.43-3.35c-.1-.074-.151-.15-.151-.22 0-.047.021-.09.051-.13zm6.565-6.218c0-1.005.247-1.863.743-2.577.495-.71 1.17-1.25 2.04-1.615.796-.335 1.756-.575 2.912-.72.39-.046 1.033-.103 1.92-.174v-.37c0-.93-.105-1.558-.3-1.875-.302-.43-.78-.65-1.44-.65h-.182c-.48.046-.896.196-1.246.46-.35.27-.575.63-.675 1.096-.06.3-.206.465-.435.51l-2.52-.315c-.248-.06-.372-.18-.372-.39 0-.046.007-.09.022-.15.247-1.29.855-2.25 1.82-2.88.976-.616 2.1-.975 3.39-1.05h.54c1.65 0 2.957.434 3.888 1.29.135.15.27.3.405.48.12.165.224.314.283.45.075.134.15.33.195.57.06.254.105.42.135.51.03.104.062.3.076.615.01.313.02.493.02.553v5.28c0 .376.06.72.165 1.036.105.313.21.54.315.674l.51.674c.09.136.136.256.136.36 0 .12-.06.226-.18.314-1.2 1.05-1.86 1.62-1.963 1.71-.165.135-.375.15-.63.045a6.062 6.062 0 01-.526-.496l-.31-.347a9.391 9.391 0 01-.317-.42l-.3-.435c-.81.886-1.603 1.44-2.4 1.665-.494.15-1.093.227-1.83.227-1.11 0-2.04-.343-2.76-1.034-.72-.69-1.08-1.665-1.08-2.94l-.05-.076zm3.753-.438c0 .566.14 1.02.425 1.364.285.34.675.512 1.155.512.045 0 .106-.007.195-.02.09-.016.134-.023.166-.023.614-.16 1.08-.553 1.424-1.178.165-.28.285-.58.36-.91.09-.32.12-.59.135-.8.015-.195.015-.54.015-1.005v-.54c-.84 0-1.484.06-1.92.18-1.275.36-1.92 1.17-1.92 2.43l-.035-.02zm9.162 7.027c.03-.06.075-.11.132-.17.362-.243.714-.41 1.05-.5a8.094 8.094 0 011.612-.24c.14-.012.28 0 .41.03.65.06 1.05.168 1.172.33.063.09.099.228.099.39v.15c0 .51-.149 1.11-.424 1.8-.278.69-.664 1.248-1.156 1.68-.073.06-.14.09-.197.09-.03 0-.06 0-.09-.012-.09-.044-.107-.12-.064-.24.54-1.26.806-2.143.806-2.64 0-.15-.03-.27-.087-.344-.145-.166-.55-.257-1.224-.257-.243 0-.533.016-.87.046-.363.045-.7.09-1 .135-.09 0-.148-.014-.18-.044-.03-.03-.036-.047-.02-.077 0-.017.006-.03.02-.063v-.06z" />, placeholder: "Your Amazon store link" },
  discord: { name: "Discord", color: "#5865F2", file: "discord", draw: null, placeholder: "https://discord.gg/..." },
  reddit: { name: "Reddit", color: "#FF4500", file: "reddit", draw: null, placeholder: "https://www.reddit.com/r/..." },
  spotify: { name: "Spotify", color: "#1DB954", file: "spotify", draw: null, placeholder: "https://open.spotify.com/..." },
  twitch: { name: "Twitch", color: "#9146FF", file: "twitch", draw: null, placeholder: "https://www.twitch.tv/..." },
  telegram: { name: "Telegram", color: "#229ED9", file: "telegram", draw: null, placeholder: "https://t.me/..." },
  messenger: { name: "Messenger", color: "#0084FF", file: "messenger", draw: null, placeholder: "https://m.me/..." },
  github: { name: "GitHub", color: "#181717", file: "github", draw: null, placeholder: "https://github.com/..." },
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

/** A pack icon (public/icons/social) painted in a color through a CSS mask */
function Masked({ file, size, color }: { file: string; size: number; color: string }) {
  const url = `url(/icons/social/${file}.svg)`;
  return <span aria-hidden style={{ display: "inline-block", width: size, height: size, background: color, WebkitMask: `${url} center / contain no-repeat`, mask: `${url} center / contain no-repeat` }} />;
}

export function LinkIcon({ icon, size = 22, colored = true }: { icon: string; size?: number; colored?: boolean }) {
  const i = LINK_ICONS[icon] ?? LINK_ICONS.link;
  if (i.file) return <Masked file={i.file} size={size} color={colored ? i.color : "currentColor"} />;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={colored ? { color: i.color } : undefined}>
      {colored && icon === "google" ? GOOGLE_G : i.draw}
    </svg>
  );
}

// Google's own four-color "G" for colored spots (badges and the colored icon)
const GOOGLE_G = (
  <g transform="scale(0.5)">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </g>
);

// brand backgrounds for the badges (a solid color unless listed here)
const BADGE_BG: Record<string, string> = {
  instagram: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285aeb 90%)",
  tiktok: "linear-gradient(135deg, #25f4ee 0%, #111 35%, #111 65%, #fe2c55 100%)",
  google: "#ffffff",
  snapchat: "#FFFC00",
  amazon: "#232F3E",
};

/** The icon alone in one color (the row of small icons on the Socials page). */
export function LinkGlyph({ icon, size = 26 }: { icon: string; size?: number }) {
  return <LinkIcon icon={icon} size={size} colored={false} />;
}

/** A modern app-style badge: the brand's color with a white icon. */
export function LinkBadge({ icon, size = 44 }: { icon: string; size?: number }) {
  const i = LINK_ICONS[icon] ?? LINK_ICONS.link;
  const dark = icon === "snapchat";
  return (
    <span className="link-badge" style={{ width: size, height: size, background: BADGE_BG[icon] ?? i.color, color: dark ? "#111" : "#fff" }} aria-hidden>
      {i.file ? (
        <Masked file={i.file} size={Math.round(size * 0.56)} color={dark ? "#111" : "#fff"} />
      ) : (
        <svg width={Math.round(size * 0.58)} height={Math.round(size * 0.58)} viewBox="0 0 24 24">
          {icon === "google" ? (
            GOOGLE_G
          ) : icon === "snapchat" ? (
            // white ghost with a black outline, like the app
            <g style={{ color: "#fff" }} stroke="#111" strokeWidth="1.1" strokeLinejoin="round">{i.draw}</g>
          ) : icon === "amazon" ? (
            <g style={{ color: "#fff" }}>{i.draw}</g>
          ) : (
            i.draw
          )}
        </svg>
      )}
    </span>
  );
}
