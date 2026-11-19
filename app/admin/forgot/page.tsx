import { AuthCard } from "@/components/admin/AuthCard";
import { ForgotForm } from "@/components/admin/AuthForms";

export const metadata = { title: "Forgot password" };

export default function Forgot() {
  return (
    <AuthCard title="Forgot your password?" note="No problem. Pick one of the ways below.">
      <ForgotForm />
    </AuthCard>
  );
}
