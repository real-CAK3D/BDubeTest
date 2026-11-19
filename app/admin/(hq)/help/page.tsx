import { HelpView } from "@/components/admin/HelpView";
import { getSettings } from "@/lib/db";

export const metadata = { title: "Help" };

export default async function HelpPage() {
  const repo = process.env.VERCEL_GIT_REPO_OWNER
    ? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
    : (await getSettings()).githubRepo.replace(/^https?:\/\/github\.com\//, "").replace(/\/$/, "");
  const guideUrl = /^[\w.-]+\/[\w.-]+$/.test(repo) ? `https://github.com/${repo}/blob/HEAD/GUIDE.md` : "";
  return <HelpView guideUrl={guideUrl} />;
}
