import { headers } from "next/headers";
import { HealthView } from "@/components/admin/HealthView";
import { lastBackup } from "@/lib/backup";
import { runChecks } from "@/lib/health";

export const metadata = { title: "Site health" };
export const dynamic = "force-dynamic";

export default async function HealthPage() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const base = (process.env.NEXT_PUBLIC_SITE_URL || `${host.startsWith("localhost") ? "http" : "https"}://${host}`).replace(/\/$/, "");
  const [checks, backup] = await Promise.all([runChecks(true), lastBackup().catch(() => null)]);
  return <HealthView checks={checks} backup={backup} healthUrl={`${base}/api/health`} />;
}
