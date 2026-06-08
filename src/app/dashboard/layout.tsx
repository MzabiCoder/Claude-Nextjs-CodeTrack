import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { getSidebarData } from '@/lib/db/sidebar';
import { auth } from '@/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userId = session?.user?.id ?? '';
  const sidebarData = await getSidebarData(userId);
  const user = session?.user ?? null;
  return <DashboardShell sidebarData={sidebarData} user={user}>{children}</DashboardShell>;
}
