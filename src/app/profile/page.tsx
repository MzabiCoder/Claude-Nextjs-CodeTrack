import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getProfileData } from "@/lib/db/profile";
import { Avatar } from "@/components/shared/Avatar";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { DeleteAccountDialog } from "./DeleteAccountDialog";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const data = await getProfileData(session.user.id);
  if (!data) redirect("/sign-in");

  const { user, stats } = data;
  const isCredentialsUser = !!user.password;

  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Your account details and settings</p>
      </div>

      {/* User info */}
      <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-5">
        <Avatar name={user.name} email={user.email} image={user.image} size={64} />
        <div className="min-w-0">
          <p className="font-semibold text-lg truncate">{user.name ?? "No name set"}</p>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          <p className="text-xs text-muted-foreground mt-1">Joined {joinedDate}</p>
        </div>
      </div>

      {/* Usage stats */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-base font-semibold">Usage</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background rounded-lg p-4 text-center">
            <p className="text-2xl font-bold">{stats.totalItems}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total items</p>
          </div>
          <div className="bg-background rounded-lg p-4 text-center">
            <p className="text-2xl font-bold">{stats.totalCollections}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Collections</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">By type</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {stats.byType.map((type) => (
              <div key={type.name} className="flex items-center gap-2 bg-background rounded-lg px-3 py-2">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: type.color }}
                />
                <span className="text-sm capitalize flex-1 truncate">{type.name}s</span>
                <span className="text-sm font-medium tabular-nums">{type.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Change password — Credentials users only */}
      {isCredentialsUser && <ChangePasswordForm />}

      {/* Delete account */}
      <DeleteAccountDialog />
    </div>
  );
}
