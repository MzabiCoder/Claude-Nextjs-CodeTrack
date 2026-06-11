import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { getSidebarData } from '@/lib/db/sidebar';
import { getSearchData } from '@/lib/db/search';
import { getEditorPreferences } from '@/lib/db/users';
import { auth } from '@/auth';

export default async function CollectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userId = session?.user?.id ?? '';
  const [sidebarData, searchData, editorPreferences] = await Promise.all([
    getSidebarData(userId),
    getSearchData(userId),
    getEditorPreferences(userId),
  ]);
  const user = session?.user ?? null;
  return <DashboardShell sidebarData={sidebarData} searchData={searchData} user={user} editorPreferences={editorPreferences}>{children}</DashboardShell>;
}
