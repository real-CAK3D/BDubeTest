import Link from "next/link";
import { POLICY_PAGES } from "@/lib/policy-text";
import { resolveMenu } from "@/lib/site-structure";
import type { SiteSettings } from "@/lib/types";
import { Logo } from "./Logo";
import { Newsletter } from "./Newsletter";
import { Social } from "./Social";

export function Footer({ s }: { s: SiteSettings }) {
  const policy = (group: "Help" | "Legal") =>
    Object.entries(POLICY_PAGES)
      .filter(([, p]) => p.group === group && s[p.field])
      .map(([slug, p]) => ({ href: `/policies/${slug}`, label: p.title }));
  // order and choice of links come from Dashboard > Pages & menu
  const help = [...resolveMenu(s).filter((m) => m.footer && !m.off).map((m) => ({ href: m.href, label: m.label })), ...policy("Help")];
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
