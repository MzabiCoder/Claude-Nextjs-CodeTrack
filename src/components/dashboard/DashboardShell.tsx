'use client';

import { useRef, useState } from 'react';
import { TopBar } from '@/components/dashboard/TopBar';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { ItemDrawer } from '@/components/dashboard/ItemDrawer';
import { ItemDrawerContext } from '@/components/dashboard/ItemDrawerContext';
import { NewItemDialog } from '@/components/dashboard/NewItemDialog';
import { NewCollectionDialog } from '@/components/dashboard/NewCollectionDialog';
import { CommandPalette, type CommandPaletteRef } from '@/components/dashboard/CommandPalette';
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

  return (
    <EditorPreferencesProvider initial={editorPreferences ?? DEFAULT_EDITOR_PREFERENCES}>
    <ItemDrawerContext.Provider value={{ openDrawer: setSelectedItemId }}>
      <div className="flex h-screen flex-col bg-background text-foreground">
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
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
      <ItemDrawer
        open={selectedItemId !== null}
        onClose={() => setSelectedItemId(null)}
        itemId={selectedItemId}
      />
      <NewItemDialog open={newItemOpen} onClose={() => setNewItemOpen(false)} />
      <NewCollectionDialog open={newCollectionOpen} onClose={() => setNewCollectionOpen(false)} />
      <CommandPalette
        ref={paletteRef}
        searchData={searchData}
        openDrawer={setSelectedItemId}
      />
    </ItemDrawerContext.Provider>
    </EditorPreferencesProvider>
  );
}
