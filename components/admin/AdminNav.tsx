"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { bottomTabs, orderedPages } from "@/lib/admin-pages";
import type { AdminPrefs } from "@/lib/types";

/*
 * The dashboard menu: a sidebar on computers, a bottom bar on phones.
 * The pages themselves are listed in lib/admin-pages.ts (EDIT-POINT: ADMIN-MENU);
 * their order, hidden ones and the bottom bar come from Customize dashboard.
 */
export function Icon({ d }: { d: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export function AdminNav({ prefs, badges }: { prefs: AdminPrefs; badges: Record<string, number> }) {
  const path = usePathname();
  const active = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));
  const pages = orderedPages(prefs).filter((p) => !p.hidden);
  const tabs = bottomTabs(prefs);
  const moreActive = !tabs.some((t) => active(t.href)) && path !== "/admin";
  // groups in the order their first page appears
  const groups = [...new Set(pages.map((p) => p.group))];
  const badge = (href: string) => (badges[href] ? <b className="nav-badge">{badges[href] > 9 ? "9+" : badges[href]}</b> : null);
  return (
    <>
      <nav className="hq-side" aria-label="Dashboard">
        {groups.map((g) => (
          <div key={g} className="hq-side-group">
            <span className="hq-side-head">{g}</span>
            {pages.filter((i) => i.group === g).map((i) => (
              <Link key={i.href} href={i.href} className={active(i.href) ? "on" : ""} aria-current={active(i.href) ? "page" : undefined}>
                <Icon d={i.icon} />
                {i.label}
                {badge(i.href)}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <nav className="hq-tabs" aria-label="Dashboard tabs">
        {tabs.map((i) => (
          <Link key={i.href} href={i.href} className={active(i.href) ? "on" : ""}>
            <Icon d={i.icon} />
            <span>{i.label}</span>
            {badge(i.href)}
          </Link>
        ))}
        <Link href="/admin/more" className={moreActive ? "on" : ""}>
          <Icon d="M5 12h.01M12 12h.01M19 12h.01" />
          <span>More</span>
        </Link>
      </nav>
    </>
  );
}
