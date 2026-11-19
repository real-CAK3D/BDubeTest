import { pageOn, resolveMenu } from "@/lib/site-structure";
import type { SiteSettings } from "@/lib/types";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { About } from "@/components/shop/Sections";
import { Tracker } from "@/components/shop/Tracker";
import { shopSettings } from "@/lib/shop-data";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await shopSettings()).aboutTitle };
}

export default async function AboutPage() {
  const s = await shopSettings();
  if (!pageOn(s, "about")) notFound();
  return (
    <>
      <Tracker />
      <About s={s} />
      <AboutLinks s={s} />
      <p className="page-next">
        <Link href="/shop" className="btn">{s.shopButton}</Link>
        <Link href="/contact" className="btn btn-ghost">Get in touch</Link>
      </p>
    </>
  );
}

// Places to go from the About page: the pages that don't need a spot in the footer
function AboutLinks({ s }: { s: SiteSettings }) {
  const on = (id: string) => resolveMenu(s).some((m) => m.id === id && !m.off);
  const cards = [
    on("gallery") && { href: "/gallery", title: s.galleryHeading || "Our work", text: "Pieces we've made for other customers." },
    on("custom") && { href: "/custom-order", title: "Custom orders", text: "Tell us what you have in mind." },
    on("review") && { href: "/review", title: "Leave a review", text: "Got something from us? We'd love to hear about it." },
    ...s.extraPages.filter((p) => on(`page:${p.slug}`)).map((p) => ({ href: `/pages/${p.slug}`, title: p.title, text: p.body.split("\n")[0].slice(0, 70) })),
    s.social.facebook && { href: s.social.facebook, title: "Facebook", text: "New pieces and behind-the-scenes from the workshop." },
    on("contact") && { href: "/contact", title: "Contact", text: "Questions, big orders, or just to say hello." },
  ].filter(Boolean) as { href: string; title: string; text: string }[];
  if (!cards.length) return null;
  return (
    <nav className="about-links" aria-label="More from us">
      {cards.map((c) => (
        <Link key={c.href} href={c.href} {...(c.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>
          <strong>{c.title}</strong>
          {c.text ? <span>{c.text}</span> : null}
        </Link>
      ))}
    </nav>
  );
}
