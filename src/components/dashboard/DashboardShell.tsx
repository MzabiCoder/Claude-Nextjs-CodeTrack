'use client';

import { useState } from 'react';
import { TopBar } from '@/components/dashboard/TopBar';
import { Sidebar } from '@/components/dashboard/Sidebar';
import type { SidebarData } from '@/lib/db/sidebar';

export interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface DashboardShellProps {
  children: React.ReactNode;
  sidebarData: SidebarData;
  user: SessionUser | null;
}

export function DashboardShell({ children, sidebarData, user }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <TopBar onMobileMenuClick={() => setMobileOpen(true)} user={user} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          sidebarData={sidebarData}
          user={user}
        />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
