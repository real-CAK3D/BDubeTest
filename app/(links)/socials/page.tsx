import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LINK_ICONS, LinkBadge, LinkGlyph, linkHref } from "@/components/LinkIcon";
import { Emblem } from "@/components/shop/Emblem";
import { LinkPageClient } from "@/components/shop/LinkPageClient";
import { Newsletter } from "@/components/shop/Newsletter";
import { qrSvg } from "@/lib/codes";
import { inkOn, placeOf } from "@/lib/link-page";
import { signedInOwner } from "@/lib/session";
import { shopSettings } from "@/lib/shop-data";
import { pageOn } from "@/lib/site-structure";
import type { LinkItem } from "@/lib/types";

async function origin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")}://${host}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const s = await shopSettings();
  const p = s.linkPage;
  const title = p.title || s.businessName;
  const description = p.bio || s.tagline || `Everything from ${title} in one place.`;
  const base = await origin();
  return {
    metadataBase: new URL(base),
    title: `${title} | Links`,
    description,
    alternates: { canonical: "/socials" },
    icons: s.favicon || s.logo ? { icon: [16, 32, 48, 192].map((n) => ({ url: `/api/favicon?s=${n}`, sizes: `${n}x${n}`, type: "image/png" })), apple: { url: "/api/favicon?s=180", sizes: "180x180" } } : undefined,
    openGraph: { title, description, url: "/socials", type: "profile", siteName: s.businessName },
    twitter: { card: "summary_large_image", title, description },
  };
}

const nameOf = (l: LinkItem) => l.label || LINK_ICONS[l.icon]?.name || "Link";

/**
 * EDIT-POINT: LINK-PAGE (the page)
 * A link-in-bio page like Linktree: picture, name, a row of social icons and
 * one big button per link. Set up under Dashboard > Link page.
 */
export default async function Socials({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const preview = Boolean((await searchParams).preview);
  const [s, owner, base] = await Promise.all([shopSettings(), signedInOwner(), origin()]);
  if (!pageOn(s, "socials")) notFound();
  const p = s.linkPage;
  const links = s.links.filter((l) => !l.hidden && l.url);
  const icons = links.filter((l) => placeOf(l) !== "button");
  const buttons = links.filter((l) => placeOf(l) !== "icon");
  const pageUrl = `${base}/socials`;
  const title = p.title || s.businessName;
  const bio = p.bio || s.tagline;
  const avatar = p.avatar || s.logo;

  // colors: worked out from the background unless the owner picked them
  const solid = p.bg === "color" || p.bg === "gradient" ? p.color1 : "";
  const ink = p.textColor || (p.bg === "image" ? "#ffffff" : solid ? inkOn(solid) : "var(--ink)");
  const btn = p.btnColor || "var(--accent)";
  const btnInk = p.btnText || (p.btnColor ? inkOn(p.btnColor) : "var(--accent-ink)");
  const background =
    p.bg === "color"
      ? p.color1
      : p.bg === "gradient"
        ? `linear-gradient(170deg, ${p.color1}, ${p.color2})`
        : p.bg === "image" && p.image
          ? `linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.55)), url("${p.image.replace(/"/g, "%22")}") center / cover fixed`
          : "radial-gradient(120% 55% at 50% 0%, color-mix(in srgb, var(--accent) 24%, transparent), transparent 72%), var(--bg)";
  const vars = { "--lt-bg": background, "--lt-ink": ink, "--lt-btn": btn, "--lt-btn-ink": btnInk } as React.CSSProperties;

  const iconRow = icons.length ? (
    <ul className="lt-icons" aria-label="Social media">
      {icons.map((l) => {
        const href = linkHref(l.icon, l.url);
        return (
          <li key={l.id}>
            <a href={href} data-lt={l.id} aria-label={nameOf(l)} title={nameOf(l)} {...(/^https?:/.test(href) ? { target: "_blank", rel: "noreferrer" } : {})}>
              <LinkGlyph icon={l.icon} size={28} />
            </a>
          </li>
        );
      })}
    </ul>
  ) : null;

  return (
    <div className={`lt lt-btn-${p.button} lt-shape-${p.shape}`} style={vars}>
      <LinkPageClient pageUrl={pageUrl} title={title} avatar={avatar} qr={p.share ? qrSvg(pageUrl) : ""} share={p.share} counting={!preview && !owner} />
      <main className="lt-col">
        <header className="lt-head">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" className={`lt-avatar ${p.avatar ? "" : "lt-avatar-logo"}`} width={96} height={96} />
          ) : (
            <span className="lt-avatar lt-avatar-logo"><Emblem initials={s.businessName.split(/\s+/).map((w) => w[0]).join("").slice(0, 3)} size={84} /></span>
          )}
          <h1>{title}</h1>
          {p.handle ? <p className="lt-handle">{p.handle}</p> : null}
          {bio ? <p className="lt-bio">{bio}</p> : null}
        </header>

        {p.iconsAt === "top" ? iconRow : null}

        <ul className="lt-links">
          {p.shopButton ? (
            <li>
              <Link href="/shop" className="lt-link lt-shop" data-lt="shop">
                <span className="lt-thumb lt-thumb-shop" aria-hidden>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8h14l-1.2 12H6.2z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
                </span>
                <span className="lt-label">{s.shopButton || "Shop"}</span>
              </Link>
              <button type="button" className="lt-more" data-share={`${base}/shop`} data-label={s.shopButton || "Shop"} aria-label="Share this link">⋮</button>
            </li>
          ) : null}
          {buttons.map((l) => {
            const href = linkHref(l.icon, l.url);
            const web = /^https?:/.test(href);
            const full = href.startsWith("/") ? `${base}${href}` : href;
            return (
              <li key={l.id}>
                <a href={href} className={`lt-link ${l.featured ? "lt-featured" : ""}`} data-lt={l.id} {...(web ? { target: "_blank", rel: "noreferrer" } : {})}>
                  <span className="lt-thumb" aria-hidden>
                    {l.thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={l.thumb} alt="" />
                    ) : (
                      <LinkBadge icon={l.icon} size={40} />
                    )}
                  </span>
                  <span className="lt-label">{nameOf(l)}</span>
                </a>
                {web || href.startsWith("/") ? <button type="button" className="lt-more" data-share={full} data-label={nameOf(l)} aria-label={`Share ${nameOf(l)}`}>⋮</button> : null}
              </li>
            );
          })}
        </ul>
        {!links.length && !p.shopButton ? <p className="lt-bio">Links coming soon.</p> : null}

        {p.subscribe ? (
          <section className="lt-subscribe">
            <Newsletter text={s.newsletterText || "Get new designs and deals by email."} />
          </section>
        ) : null}

        {p.iconsAt === "bottom" ? iconRow : null}

        <footer className="lt-foot">
          <Link href="/">{p.footer || s.businessName}</Link>
        </footer>
      </main>
      {owner && !preview ? <Link href="/admin/link-page" className="lt-edit">Edit this page</Link> : null}
    </div>
  );
}
