import { NextResponse } from "next/server";
import { syncToGitHub } from "@/lib/github-sync";

// Saves everything to site-variables.ts on GitHub right now.
export async function POST() {
  const st = await syncToGitHub("site content");
  return st.ok ? NextResponse.json({ ok: true, message: st.message }) : NextResponse.json({ error: st.message }, { status: 400 });
}
