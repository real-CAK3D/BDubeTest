import "server-only";
import { repoName, SYNC_TAG } from "./github-sync";
import { getKey } from "./keys";
import { seal, unseal } from "./private-data";
import { kv, storageMode } from "./store";

/*
 * EDIT-POINT: BACKUPS
 * A copy of everything the shop has saved (settings, items, orders, customers,
 * codes...). Customer details stay locked (encrypted) inside it, so a backup
 * only opens on this site with the same AUTH_SECRET.
 *  - Download one any time: Dashboard > Site health > Download a backup.
 *  - Automatic: once a week a locked copy is saved to your GitHub repository
 *    (backups/shop-backup.json), only if that repository is private.
 */
type Backup = { format: "shop-backup"; version: 1; at: string; storage: string; data: Record<string, unknown> };
export type BackupStatus = { at: string; ok: boolean; message: string };
const SKIP = /^(lock:|presence|liveAgents|health:)/; // live, throwaway things

export async function makeBackup(): Promise<Backup> {
  const data: Record<string, unknown> = {};
  for (const k of (await kv.keys()).sort()) {
    if (SKIP.test(k)) continue;
    try {
      data[k] = await kv.get(k);
    } catch {
      data[k] = { __hash: await kv.hgetall(k) }; // counters (Redis keeps those differently)
    }
  }
  return { format: "shop-backup", version: 1, at: new Date().toISOString(), storage: storageMode, data };
}

/** Puts a backup back. Keys it has replace what's saved now; anything else is left alone. */
export async function restoreBackup(raw: unknown) {
  const b = unseal<Backup>(raw);
  if (!b || b.format !== "shop-backup" || typeof b.data !== "object") throw new Error("That isn't a shop backup file.");
  let n = 0;
  for (const [k, v] of Object.entries(b.data)) {
    if (SKIP.test(k)) continue;
    if (v && typeof v === "object" && "__hash" in (v as object)) {
      const now = await kv.hgetall(k).catch(() => ({}) as Record<string, number>);
      for (const [f, x] of Object.entries((v as { __hash: Record<string, number> }).__hash)) await kv.hincrby(k, f, Number(x) - Number(now[f] ?? 0));
    } else await kv.set(k, v);
    n++;
  }
  return { keys: n, from: b.at };
}

export const lastBackup = () => kv.get<BackupStatus>("backup:last");

/** The weekly copy to GitHub (private repositories only). */
export async function backupToGitHub(): Promise<BackupStatus> {
  const done = async (ok: boolean, message: string) => {
    const s = { at: new Date().toISOString(), ok, message };
    await kv.set("backup:last", s).catch(() => {});
    return s;
  };
  const token = await getKey("GITHUB_SYNC_TOKEN");
  const repo = await repoName();
  if (!token || !repo) return done(false, "No GitHub token yet, so no automatic copy. Download one from Site health now and then.");
  const headers = { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28", "user-agent": "shop-dashboard" };
  try {
    const info = await fetch(`https://api.github.com/repos/${repo}`, { headers, cache: "no-store" });
    if (!info.ok) return done(false, `GitHub said ${info.status} when checking the repository.`);
    if (!((await info.json()) as { private?: boolean }).private) return done(false, "Your GitHub repository is public, so backups aren't put there (even locked). Make it private on GitHub, or download a backup from Site health.");
    const branch = process.env.VERCEL_GIT_COMMIT_REF || "main";
    const path = "backups/shop-backup.json";
    const api = `https://api.github.com/repos/${repo}/contents/${path}`;
    const cur = await fetch(`${api}?ref=${encodeURIComponent(branch)}`, { headers, cache: "no-store" });
    const sha = cur.ok ? ((await cur.json()) as { sha: string }).sha : undefined;
    const body = JSON.stringify(seal(await makeBackup()));
    const put = await fetch(api, {
      method: "PUT",
      headers: { ...headers, "content-type": "application/json" },
      body: JSON.stringify({ message: `Weekly backup ${SYNC_TAG}`, content: Buffer.from(body).toString("base64"), sha, branch }),
    });
    if (!put.ok) return done(false, `GitHub said ${put.status} when saving the backup.`);
    return done(true, `Saved a locked copy to ${repo} (${path}).`);
  } catch (e) {
    return done(false, (e as Error).message);
  }
}
