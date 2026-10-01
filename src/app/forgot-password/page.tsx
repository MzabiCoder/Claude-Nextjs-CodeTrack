import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { AuthShell } from "@/components/shared/AuthShell";

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
