import { RegisterForm } from "./RegisterForm";
import { AuthShell } from "@/components/shared/AuthShell";

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  return (
    <AuthShell>
      <RegisterForm />
    </AuthShell>
  );
}
