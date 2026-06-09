import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { getSidebarData } from '@/lib/db/sidebar';
import { getSearchData } from '@/lib/db/search';
import { auth } from '@/auth';

export default async function ItemsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userId = session?.user?.id ?? '';
  const [sidebarData, searchData] = await Promise.all([
    getSidebarData(userId),
    getSearchData(userId),
  ]);
  const user = session?.user ?? null;
  return <DashboardShell sidebarData={sidebarData} searchData={searchData} user={user}>{children}</DashboardShell>;
}
