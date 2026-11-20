import { NextResponse } from "next/server";
import { backupToGitHub, makeBackup, restoreBackup } from "@/lib/backup";
import { mutating } from "@/lib/store";

// Dashboard > Site health: download a backup (customer details stay locked inside), put one back, or save to GitHub now.
export async function GET() {
  const b = await makeBackup();
  return new Response(JSON.stringify(b), {
    headers: { "content-type": "application/json", "content-disposition": `attachment; filename="shop-backup-${b.at.slice(0, 10)}.json"`, "cache-control": "no-store" },
  });
}

async function handlePOST(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("to") === "github") return NextResponse.json(await backupToGitHub());
  try {
    const r = await restoreBackup(await req.json());
    return NextResponse.json({ ok: true, message: `Put back ${r.keys} saved things from the backup of ${new Date(r.from).toLocaleString("en-US")}.` });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
export const POST = mutating(handlePOST);
