import { LiveAgent } from "@/components/admin/LiveAgent";
import { listChats } from "@/lib/live-chat";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { AuthCard } from "@/components/admin/AuthCard";
import { ChoosePassword } from "@/components/admin/AuthForms";
import { getSession } from "@/lib/admin-security";
import { currentSession } from "@/lib/session";
import { AdminPing } from "@/components/admin/AdminPing";
import { HelpButton } from "@/components/admin/HelpButton";
import { RegisterSW } from "@/components/admin/RegisterSW";
import { getMessages, getNotifications, getOrders, getRequests, getReviews, getSettings } from "@/lib/db";

export default async function HQLayout({ children }: { children: React.ReactNode }) {
  const sid = await currentSession();
  const me = sid ? await getSession(sid) : null;
  // signed in with the starter password: choose your own before anything else
  if (me?.pending)
    return (
      <AuthCard title="Choose your password" note="One quick step.">
        <ChoosePassword name={me.name} />
      </AuthCard>
    );
  const [s, notes, orders, requests, reviews, messages, live] = await Promise.all([getSettings(), getNotifications(), getOrders(), getRequests(), getReviews(), getMessages(), listChats().catch(() => [])]);
  const unread = notes.filter((n) => !n.read).length;
  const a = s.admin;
  const accent = /^#[0-9a-f]{6}$/i.test(a.accent) ? a.accent : "";
  const badges = {
    "/admin/orders": orders.filter((o) => o.status === "paid").length,
    "/admin/requests": requests.filter((r) => r.status === "new").length,
    "/admin/reviews": reviews.filter((r) => r.status === "pending").length,
    "/admin/inbox": messages.filter((m) => !m.read).length,
    "/admin/live": live.filter((c) => c.status !== "closed" && c.unread > 0).length,
  };
  return (
    <div className="hq-shell" data-mode={a.mode} data-density={a.density} data-text={a.textSize} style={accent ? ({ "--owner-accent": accent, "--owner-accent-ink": inkFor(accent) } as React.CSSProperties) : undefined}>
      <RegisterSW />
      <AdminPing />
      <header className="hq-top">
        <Link href="/admin" className="hq-brand">
          <span className="hq-star" aria-hidden>★</span>
          <span>{a.title || s.businessName}</span>
        </Link>
        <div className="hq-top-actions">
          <a href="/" target="_blank" rel="noreferrer" className="b b-ghost b-sm view-site" aria-label="Open the shop in a new tab">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 9l1.5-5h15L21 9M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0zM5 13v7h14v-7M10 20v-4h4v4" />
            </svg>
            <span className="view-site-text">View shop</span>
          </a>
          <LiveAgent />
          <HelpButton />
          <Link href="/admin/notifications" className="bell" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8" />
              <path d="M10.3 20a1.9 1.9 0 0 0 3.4 0" />
            </svg>
            {unread ? <b>{unread > 9 ? "9+" : unread}</b> : null}
          </Link>
        </div>
      </header>
      <AdminNav prefs={a} badges={badges} />
      <main className="hq-main">{children}</main>
    </div>
  );
}

/** Black or white text, whichever reads better on the owner's main color. */
function inkFor(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.22 ? "#111111" : "#FFFFFF";
}
