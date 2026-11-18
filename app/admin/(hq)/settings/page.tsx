import { SettingsForm } from "@/components/admin/SettingsForm";
import { getPushSubs, getSettings } from "@/lib/db";
import { lastGitHubSync } from "@/lib/github-sync";
import { getKey } from "@/lib/keys";

export const metadata = { title: "Settings" };

export default async function Settings() {
  const [s, subs, vapid, stripeKey, resend, ghToken, ghLast] = await Promise.all([getSettings(), getPushSubs(), getKey("NEXT_PUBLIC_VAPID_PUBLIC_KEY"), getKey("STRIPE_SECRET_KEY"), getKey("RESEND_API_KEY"), getKey("GITHUB_SYNC_TOKEN"), lastGitHubSync().catch(() => null)]);
  const repo = process.env.VERCEL_GIT_REPO_OWNER ? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}` : s.githubRepo;
  return (
    <SettingsForm
      initial={s}
      vapidKey={vapid ?? ""}
      deviceCount={subs.length}
      stripeTest={Boolean(stripeKey?.includes("_test_"))}
      hasResend={Boolean(resend)}
      repo={repo}
      github={{ token: Boolean(ghToken), last: ghLast }}
    />
  );
}
