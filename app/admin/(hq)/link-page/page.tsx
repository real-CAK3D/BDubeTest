import { headers } from "next/headers";
import { LinkPageManager } from "@/components/admin/LinkPageManager";
import { qrSvg } from "@/lib/codes";
import { getSettings } from "@/lib/db";
import { linkPageStats } from "@/lib/link-stats";

export const metadata = { title: "Link page" };

export default async function LinkPage() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const base = (process.env.NEXT_PUBLIC_SITE_URL || `${h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")}://${host}`).replace(/\/$/, "");
  const url = `${base}/socials`;
  const [s, stats] = await Promise.all([getSettings(), linkPageStats(30)]);
  return <LinkPageManager initial={s} stats={stats} url={url} qr={qrSvg(url)} />;
}
