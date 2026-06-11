import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserForSettings } from "@/lib/db/users";
import { ChangePasswordForm } from "@/app/profile/ChangePasswordForm";
import { DeleteAccountDialog } from "@/app/profile/DeleteAccountDialog";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const user = await getUserForSettings(session.user.id);
  if (!user) redirect("/sign-in");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account settings</p>
      </div>

      {user.hasPassword && <ChangePasswordForm />}

      <DeleteAccountDialog />
    </div>
  );
}
