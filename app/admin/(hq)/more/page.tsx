import Link from "next/link";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { bottomTabs, orderedPages } from "@/lib/admin-pages";
import { getSettings } from "@/lib/db";

export const metadata = { title: "More" };

export default async function More() {
  const s = await getSettings();
  const inBar = new Set(bottomTabs(s.admin).map((t) => t.href));
  const pages = orderedPages(s.admin).filter((p) => !inBar.has(p.href));
  const groups = [...new Set(pages.map((p) => p.group))];
  return (
    <>
      <div className="page-head">
        <h1>More</h1>
        <a className="b b-ghost b-sm" href="/" target="_blank" rel="noreferrer">Open the shop</a>
      </div>
      {groups.map((g) => (
        <section key={g} className="more-group">
          <h2>{g}</h2>
          <ul className="menu-list">
            {pages.filter((p) => p.group === g).map((l) => (
              <li key={l.href}>
                <Link href={l.href}>
                  <strong>{l.label}</strong>
                  <span className="muted">{l.note}{l.hidden ? " (hidden from the menu)" : ""}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="muted small">Change what&apos;s in the bottom bar and the menu order in <Link href="/admin/customize">Customize dashboard</Link>.</p>
      <LogoutButton />
    </>
  );
}
