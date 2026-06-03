import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { getSidebarData } from '@/lib/db/sidebar';
import { auth } from '@/auth';

export default async function ItemsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarData, session] = await Promise.all([getSidebarData(), auth()]);
  const user = session?.user ?? null;
  return <DashboardShell sidebarData={sidebarData} user={user}>{children}</DashboardShell>;
}
