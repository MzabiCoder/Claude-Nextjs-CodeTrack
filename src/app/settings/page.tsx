import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getUserForSettings } from "@/lib/db/users";
import { ChangePasswordForm } from "@/app/profile/ChangePasswordForm";
import { DeleteAccountDialog } from "@/app/profile/DeleteAccountDialog";
import { EditorPreferencesSection } from "./EditorPreferencesSection";
import { buttonVariants } from "@/components/ui/button";

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

      <EditorPreferencesSection initial={user.editorPreferences} />

      <div className="rounded-lg border border-border p-5 space-y-3">
        <div>
          <h2 className="font-semibold">Billing</h2>
          <p className="text-sm text-muted-foreground">
            {user.isPro ? 'You are on DevStash Pro.' : 'You are on the free plan.'}
          </p>
        </div>
        <Link
          href="/billing"
          className={buttonVariants({ variant: user.isPro ? 'outline' : 'default' })}
        >
          {user.isPro ? 'Manage subscription' : 'Upgrade to Pro'}
        </Link>
      </div>

      {user.hasPassword && <ChangePasswordForm />}

      <DeleteAccountDialog />
    </div>
  );
}
