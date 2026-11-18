import Link from "next/link";
import { POLICY_PAGES } from "@/lib/policy-text";
import type { SiteSettings } from "@/lib/types";
import { Logo } from "./Logo";
import { Newsletter } from "./Newsletter";
import { Social } from "./Social";

export function Footer({ s }: { s: SiteSettings }) {
  const policy = (group: "Help" | "Legal") =>
    Object.entries(POLICY_PAGES)
      .filter(([, p]) => p.group === group && s[p.field])
      .map(([slug, p]) => ({ href: `/policies/${slug}`, label: p.title }));
  const help = [
    ...s.extraPages.filter((p) => p.inFooter).map((p) => ({ href: `/pages/${p.slug}`, label: p.title })),
    ...policy("Help"),
    { href: "/order-status", label: "Order status" },
    ...(s.showCustomOrders ? [{ href: "/custom-order", label: "Custom order form" }] : []),
    ...(s.showReviews ? [{ href: "/review", label: "Leave a review" }] : []),
    { href: "/contact", label: "Contact" },
  ];
  const legal = policy("Legal");
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Logo s={s} size={64} />
          <div>
            <strong>{s.businessName}</strong>
            {s.showVeteranBadge && s.serviceLine ? <p className="muted">{s.serviceLine}</p> : null}
          </div>
        </div>
        <nav className="footer-links" aria-label="Help">
          <span className="footer-head">Help</span>
          {help.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
        </nav>
        {legal.length ? (
          <nav className="footer-links" aria-label="Legal">
            <span className="footer-head">Legal</span>
            {legal.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
          </nav>
        ) : null}
        <div className="footer-side">
          {s.showNewsletter ? <Newsletter text={s.newsletterText} /> : null}
          <Social links={s.social} />
        </div>
      </div>
      {/*
          EDIT-POINT: FOOTER
          Small print at the very bottom of every shop page. The business name and
          the note after it come from the dashboard (Words & logos > Footer).
          */}
      <p className="fine">
        © {new Date().getFullYear()} {s.businessName}. All rights reserved.{s.footerNote ? ` ${s.footerNote}` : ""}
        {" "}<Link href="/admin" className="owner-link">Owner login</Link>
      </p>
    </footer>
  );
}
