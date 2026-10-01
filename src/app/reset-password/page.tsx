import { redirect } from "next/navigation";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { AuthShell } from "@/components/shared/AuthShell";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/forgot-password");
  }

  return (
    <AuthShell>
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
