"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CartButton } from "./CartButton";
import { HeaderIcons } from "./HeaderIcons";

/*
 * The menu links in the top bar of the shop. Which pages show and in what
 * order is set in the dashboard (Pages & menu). On phones they fold into the
 * Menu button.
 */
export type NavLink = { href: string; label: string };

export function NavLinks({ links }: { links: NavLink[] }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  return (
    <nav className={`nav ${open ? "open" : ""}`} aria-label="Main">
      <button type="button" className="menu-btn" aria-expanded={open} aria-controls="nav-links" onClick={() => setOpen(!open)}>
        Menu
      </button>
      <div id="nav-links" className="nav-links">
        {links.map((l) => (
          <Link key={l.href} href={l.href} {...(/^https?:/.test(l.href) ? { target: "_blank", rel: "noreferrer" } : {})} aria-current={path === l.href || path.startsWith(l.href + "/") ? "page" : undefined}>
            {l.label}
          </Link>
        ))}
      </div>
      <HeaderIcons />
      <CartButton />
    </nav>
  );
}
