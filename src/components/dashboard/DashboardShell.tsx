'use client';

import { useRef, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { TopBar } from '@/components/dashboard/TopBar';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { ItemDrawer } from '@/components/dashboard/item-drawer/ItemDrawer';
import { ItemDrawerContext } from '@/components/dashboard/ItemDrawerContext';
import { NewItemDialog } from '@/components/dashboard/NewItemDialog';
import { CollectionFormDialog } from '@/components/shared/CollectionFormDialog';
import { CommandPalette, type CommandPaletteRef } from '@/components/dashboard/CommandPalette';
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav';
import { MotionPage } from '@/components/motion';
import { EditorPreferencesProvider } from '@/context/EditorPreferencesContext';
import type { SidebarData } from '@/lib/db/sidebar';
import type { SearchData } from '@/lib/db/search';
import type { EditorPreferences } from '@/types/editor';
import { DEFAULT_EDITOR_PREFERENCES } from '@/types/editor';

export interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isPro?: boolean;
}

interface DashboardShellProps {
  children: React.ReactNode;
  sidebarData: SidebarData;
  user: SessionUser | null;
  searchData: SearchData;
  editorPreferences?: EditorPreferences;
}

export function DashboardShell({ children, sidebarData, user, searchData, editorPreferences }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [newItemOpen, setNewItemOpen] = useState(false);
  const [newCollectionOpen, setNewCollectionOpen] = useState(false);
  const paletteRef = useRef<CommandPaletteRef>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handler() { setNewItemOpen(true); }
    window.addEventListener('open-new-item-dialog', handler);
    return () => window.removeEventListener('open-new-item-dialog', handler);
  }, []);

  return (
    <EditorPreferencesProvider initial={editorPreferences ?? DEFAULT_EDITOR_PREFERENCES}>
    <ItemDrawerContext.Provider value={{ openDrawer: setSelectedItemId }}>
      <div className="flex h-[100svh] flex-col bg-background text-foreground">
        <TopBar
          onMobileMenuClick={() => setMobileOpen(true)}
          onNewCollectionClick={() => setNewCollectionOpen(true)}
          onNewItemClick={() => setNewItemOpen(true)}
          onSearchClick={() => paletteRef.current?.open()}
          user={user}
        />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            mobileOpen={mobileOpen}
            onMobileClose={() => setMobileOpen(false)}
            sidebarData={sidebarData}
            user={user}
          />
          <main className="scrollbar-slim relative flex-1 overflow-y-auto">
            <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-[0.35]" aria-hidden="true" />
            <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-28 pt-5 sm:px-6 sm:pb-8 sm:pt-6 lg:px-8 lg:pt-8 2xl:max-w-[96rem]">
              <AnimatePresence mode="wait" initial={false}>
                <MotionPage key={pathname}>{children}</MotionPage>
              </AnimatePresence>
            </div>
          </main>
        </div>
        <MobileBottomNav
          onNewItemClick={() => setNewItemOpen(true)}
          onSearchClick={() => paletteRef.current?.open()}
        />
      </div>
      <ItemDrawer
        open={selectedItemId !== null}
        onClose={() => setSelectedItemId(null)}
        itemId={selectedItemId}
        isPro={user?.isPro ?? false}
      />
      <NewItemDialog open={newItemOpen} onClose={() => setNewItemOpen(false)} isPro={user?.isPro ?? false} />
      <CollectionFormDialog open={newCollectionOpen} onClose={() => setNewCollectionOpen(false)} />
      <CommandPalette
        ref={paletteRef}
        searchData={searchData}
        openDrawer={setSelectedItemId}
      />
    </ItemDrawerContext.Provider>
    </EditorPreferencesProvider>
  );
}
