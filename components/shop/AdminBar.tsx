"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

/*
 * Only drawn for a signed-in owner (the shop checks the login on the server;
 * customers never get this in their page at all): a button back to the
 * dashboard, plus a shortcut to edit what's on screen.
 */
export function AdminBar({ editProduct }: { editProduct?: boolean }) {
  const path = usePathname();
  const edit = path.startsWith("/product/")
    ? { href: "/admin/products", label: "Edit items" }
    : path.startsWith("/gallery")
      ? { href: "/admin/gallery", label: "Edit our work" }
      : path === "/" || path === "/about" || path === "/contact"
        ? { href: `/admin/content?tab=${path === "/" ? "home" : path.slice(1)}`, label: "Edit words" }
        : path.startsWith("/pages/")
          ? { href: "/admin/pages", label: "Edit page" }
          : null;
  return (
    <nav className="admin-bar" aria-label="Owner">
      <Link href="/admin" className="ab-main">
        <span aria-hidden>★</span> Shop HQ
      </Link>
      {edit && editProduct !== false ? <Link href={edit.href}>{edit.label}</Link> : null}
    </nav>
  );
}
