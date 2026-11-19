import { AuthCard } from "@/components/admin/AuthCard";
import { ResetForm } from "@/components/admin/AuthForms";

export const metadata = { title: "Reset password" };

export default async function Reset({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  return (
    <AuthCard title="Choose a new password" note="This link works once, for 30 minutes.">
      <ResetForm token={String(t ?? "")} />
    </AuthCard>
  );
}
