import "server-only";
import { getProducts, getSettings } from "./db";
import { getKey } from "./keys";
import { kv } from "./store";
import { settingsToVariables, variablesFile } from "./variables-file";

/*
 * EDIT-POINT: GITHUB-SYNC
 * After a dashboard edit, writes the shop's current content to site-variables.ts
 * on GitHub so the repository always matches the live site. The edit is already
 * live from the database, so these commits are marked "[dashboard sync]" and
 * vercel.json tells Vercel not to rebuild for them.
 */

export const SYNC_TAG = "[dashboard sync]";
const PATH = "site-variables.ts";
export type SyncStatus = { at: string; ok: boolean; message: string; url?: string };

export async function repoName() {
  if (process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG) return `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`;
  const r = (await getSettings()).githubRepo.replace(/^https?:\/\/github\.com\//, "").replace(/\.git$|\/$/g, "");
  return /^[\w.-]+\/[\w.-]+$/.test(r) ? r : "";
}

export async function lastGitHubSync() {
  return kv.get<SyncStatus>("github:lastSync");
}

export async function syncToGitHub(reason: string): Promise<SyncStatus> {
  const token = await getKey("GITHUB_SYNC_TOKEN");
  const repo = await repoName();
  if (!token || !repo) return { at: new Date().toISOString(), ok: false, message: !token ? "No GitHub token yet (Accounts & keys)." : "GitHub repository not known (Settings > Your accounts)." };
  const branch = process.env.VERCEL_GIT_COMMIT_REF || "main";
  const api = `https://api.github.com/repos/${repo}/contents/${PATH}`;
  const headers = { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28", "user-agent": "shop-dashboard" };
  let status: SyncStatus;
  try {
    const [s, products] = await Promise.all([getSettings(), getProducts()]);
    const text = variablesFile(settingsToVariables(s, products));
    const cur = await fetch(`${api}?ref=${encodeURIComponent(branch)}`, { headers, cache: "no-store" });
    let sha: string | undefined;
    if (cur.ok) {
      const body = (await cur.json()) as { sha: string; content: string };
      sha = body.sha;
      if (Buffer.from(body.content, "base64").toString("utf8") === text) {
        return { at: new Date().toISOString(), ok: true, message: "Already up to date." };
      }
    } else if (cur.status !== 404) {
      throw new Error(cur.status === 401 || cur.status === 403 ? "GitHub didn't accept the token. Check its permissions (Contents: Read and write) on Accounts & keys." : `GitHub said ${cur.status}.`);
    }
    const put = await fetch(api, {
      method: "PUT",
      headers: { ...headers, "content-type": "application/json" },
      body: JSON.stringify({ message: `Update ${reason} from the dashboard ${SYNC_TAG}`, content: Buffer.from(text, "utf8").toString("base64"), sha, branch }),
    });
    if (!put.ok) {
      const b = (await put.json().catch(() => ({}))) as { message?: string };
      throw new Error(`GitHub said ${put.status}: ${b.message ?? "unknown error"}`);
    }
    const res = (await put.json()) as { commit?: { html_url?: string } };
    status = { at: new Date().toISOString(), ok: true, message: `Saved: ${reason}`, url: res.commit?.html_url };
  } catch (e) {
    status = { at: new Date().toISOString(), ok: false, message: (e as Error).message };
  }
  await kv.set("github:lastSync", status).catch(() => {});
  return status;
}
