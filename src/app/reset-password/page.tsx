import { redirect } from "next/navigation";
import { ResetPasswordForm } from "./ResetPasswordForm";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/forgot-password");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <ResetPasswordForm token={token} />
    </div>
  );
}
