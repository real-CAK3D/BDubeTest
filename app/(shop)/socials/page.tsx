import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LINK_ICONS, LinkBadge, linkHref } from "@/components/LinkIcon";
import { Logo } from "@/components/shop/Logo";
import { Tracker } from "@/components/shop/Tracker";
import { shopSettings } from "@/lib/shop-data";
import { pageOn } from "@/lib/site-structure";

export async function generateMetadata(): Promise<Metadata> {
  const s = await shopSettings();
  return { title: "Socials", description: `Find ${s.businessName} on social media.` };
}

// A link-tree style page: logo, name, and one big button per link (Dashboard > Words & logos > Socials).
export default async function Socials() {
  const s = await shopSettings();
  if (!pageOn(s, "socials")) notFound();
  const links = s.links.filter((l) => !l.hidden && l.url);
  return (
    <section className="section linktree">
      <Tracker />
      <div className="linktree-head">
        <Logo s={s} size={96} />
        <h1>{s.businessName}</h1>
        {s.tagline ? <p className="lede">{s.tagline}</p> : null}
      </div>
      {links.length ? (
        <ul className="linktree-list">
          {links.map((l) => {
            const href = linkHref(l.icon, l.url);
            const outside = /^https?:/.test(href);
            return (
              <li key={l.id}>
                <a href={href} {...(outside ? { target: "_blank", rel: "noreferrer" } : {})}>
                  <LinkBadge icon={l.icon} size={48} />
                  <span className="linktree-label">{l.label || LINK_ICONS[l.icon]?.name || "Link"}</span>
                  <span aria-hidden className="linktree-arrow">›</span>
                </a>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="muted">Links coming soon.</p>
      )}
      <Link href="/shop" className="btn linktree-shop">{s.shopButton || "Shop"}</Link>
    </section>
  );
}
