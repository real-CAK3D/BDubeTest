import { NextResponse } from "next/server";
import { newId } from "@/lib/db";
import { getVault, saveVault, type VaultEntry } from "@/lib/vault";

const clip = (v: unknown, n: number) => String(v ?? "").slice(0, n);
// the list never includes passwords; "reveal" returns one when asked
const safe = (l: VaultEntry[]) => l.map(({ password, ...rest }) => ({ ...rest, hasPassword: Boolean(password) }));

export async function GET() {
  return NextResponse.json(safe(await getVault()));
}

// { action: "save", entry } | { action: "delete", id } | { action: "reveal", id }
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const list = await getVault();
  if (b.action === "reveal") return NextResponse.json({ password: list.find((x) => x.id === b.id)?.password ?? "" });
  if (b.action === "delete") {
    await saveVault(list.filter((x) => x.id !== b.id));
    return NextResponse.json(safe(list.filter((x) => x.id !== b.id)));
  }
  if (b.action === "save") {
    const e = b.entry ?? {};
    const url = clip(e.url, 300).trim();
    if (url && !/^https?:\/\//i.test(url)) return NextResponse.json({ error: "Web addresses start with https://" }, { status: 400 });
    const old = list.find((x) => x.id === e.id);
    const entry: VaultEntry = {
      id: old?.id ?? newId(),
      service: clip(e.service, 60).trim() || "Login",
      url,
      username: clip(e.username, 200),
      // an empty password box when editing keeps the saved one
      password: typeof e.password === "string" && e.password ? clip(e.password, 500) : old?.password ?? "",
      note: clip(e.note, 500),
      updatedAt: new Date().toISOString(),
    };
    const next = old ? list.map((x) => (x.id === old.id ? entry : x)) : [entry, ...list];
    await saveVault(next);
    return NextResponse.json(safe(next));
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
