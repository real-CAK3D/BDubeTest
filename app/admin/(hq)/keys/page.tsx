import { KeysManager } from "@/components/admin/KeysManager";
import { getSettings } from "@/lib/db";
import { lastGitHubSync } from "@/lib/github-sync";
import { getKey, keyStatuses, strongEncryption } from "@/lib/keys";
import { getStatus } from "@/lib/status";

export const metadata = { title: "Accounts & keys" };

export default async function KeysPage() {
  const [keys, s, st, stripe, gh, last] = await Promise.all([keyStatuses(), getSettings(), getStatus(), getKey("STRIPE_SECRET_KEY"), getKey("GITHUB_SYNC_TOKEN"), lastGitHubSync().catch(() => null)]);
  const repo = process.env.VERCEL_GIT_REPO_OWNER ? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}` : s.githubRepo;
  return (
    <KeysManager
      initial={keys}
      strong={strongEncryption()}
      onVercel={Boolean(process.env.VERCEL)}
      database={{ ok: st.database.ok, detail: st.database.detail }}
      repo={repo}
      github={{ token: Boolean(gh), last }}
      stripeTest={Boolean(stripe?.includes("_test_"))}
      links={s.customLinks}
    />
  );
}
