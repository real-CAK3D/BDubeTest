import { LiveDesk } from "@/components/admin/LiveDesk";

export const metadata = { title: "Live chat" };

export default async function LivePage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  return <LiveDesk openId={(await searchParams).c} />;
}
