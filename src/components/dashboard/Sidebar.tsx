'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Code, Sparkles, Terminal, StickyNote, File, Image as ImageIcon,
  Link as LinkIcon, PanelLeftClose, PanelLeftOpen, Star, ChevronDown, LogOut, User,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import type { SidebarData } from '@/lib/db/sidebar';
import type { SessionUser } from '@/components/dashboard/DashboardShell';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/shared/Avatar';

const TYPE_ICONS: Record<string, React.ElementType> = {
  snippet: Code,
  prompt: Sparkles,
  command: Terminal,
  note: StickyNote,
  file: File,
  image: ImageIcon,
  link: LinkIcon,
};

const TYPE_SLUGS: Record<string, string> = {
  snippet: 'snippets',
  prompt: 'prompts',
  command: 'commands',
  note: 'notes',
  file: 'files',
  image: 'images',
  link: 'links',
};

function SidebarContent({
  collapsed = false,
  sidebarData,
  user,
}: {
  collapsed?: boolean;
  sidebarData: SidebarData;
  user: SessionUser | null;
}) {
  const [collectionsOpen, setCollectionsOpen] = useState(true);
  const favoriteCollections = sidebarData.collections.filter((c) => c.isFavorite);
  const recentCollections = sidebarData.collections.filter((c) => !c.isFavorite);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Item Types */}
      <div className="px-3 py-3">
        {!collapsed && (
          <p className="px-2 mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Types
          </p>
        )}
        <nav className="space-y-0.5">
          {sidebarData.itemTypes.map((type) => {
            const Icon = TYPE_ICONS[type.name] ?? Code;
            return (
              <Link
                key={type.id}
                href={`/items/${TYPE_SLUGS[type.name] ?? `${type.name}s`}`}
                className={cn(
                  'flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
                  collapsed && 'justify-center px-0'
                )}
                title={collapsed ? (TYPE_SLUGS[type.name] ?? `${type.name}s`) : undefined}
              >
                <Icon
                  className="h-4 w-4 shrink-0"
                  style={{ color: type.color }}
                />
                {!collapsed && (
                  <>
                    <span className="capitalize">{TYPE_SLUGS[type.name] ?? `${type.name}s`}</span>
                    {(type.name === 'file' || type.name === 'image') && (
                      <Badge variant="secondary" className="h-4 px-1 text-[10px] font-semibold leading-none">
                        PRO
                      </Badge>
                    )}
                    <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                      {type.count}
                    </span>
                  </>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Collections */}
      {!collapsed && (
        <div className="px-3 border-t border-border pt-3 flex-1">
          <button
            onClick={() => setCollectionsOpen(!collectionsOpen)}
            className="flex items-center gap-1 px-2 mb-1.5 w-full group"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
              Collections
            </span>
            <ChevronDown
              className={cn(
                'h-3 w-3 text-muted-foreground group-hover:text-foreground transition-all duration-200',
                !collectionsOpen && '-rotate-90'
              )}
            />
          </button>

          {collectionsOpen && (
            <>
              {/* Favorites */}
              {favoriteCollections.length > 0 && (
                <div className="mb-3">
                  <p className="px-2 mb-1 text-xs text-muted-foreground">Favorites</p>
                  <nav className="space-y-0.5">
                    {favoriteCollections.map((col) => (
                      <Link
                        key={col.id}
                        href={`/collections/${col.id}`}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <Star className="h-3.5 w-3.5 shrink-0 text-yellow-400 fill-yellow-400" />
                        <span className="truncate flex-1">{col.name}</span>
                        <span className="text-xs tabular-nums text-muted-foreground">{col.itemCount}</span>
                      </Link>
                    ))}
                  </nav>
                </div>
              )}

              {/* Recent */}
              {recentCollections.length > 0 && (
                <div>
                  <p className="px-2 mb-1 text-xs text-muted-foreground">Recent</p>
                  <nav className="space-y-0.5">
                    {recentCollections.map((col) => (
                      <Link
                        key={col.id}
                        href={`/collections/${col.id}`}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full shrink-0"
                          style={{ backgroundColor: col.dominantColor }}
                        />
                        <span className="truncate flex-1">{col.name}</span>
                        <span className="text-xs tabular-nums text-muted-foreground">{col.itemCount}</span>
                      </Link>
                    ))}
                  </nav>
                </div>
              )}

              {/* View all link */}
              <Link
                href="/collections"
                className="flex items-center px-2 py-1.5 mt-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                View all collections →
              </Link>
            </>
          )}
        </div>
      )}

      {/* User */}
      <div className="mt-auto px-3 py-3 border-t border-border">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              'flex items-center gap-2.5 w-full rounded-md px-1 py-1 hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              collapsed && 'justify-center px-0'
            )}
          >
            <Avatar name={user?.name} email={user?.email} image={user?.image} size={28} />
            {!collapsed && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium leading-tight truncate">{user?.name ?? "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-52">
            <div className="px-1.5 py-1 border-b border-border mb-1">
              <p className="text-sm font-medium truncate">{user?.name ?? "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <DropdownMenuItem onClick={() => { window.location.href = "/profile"; }}>
              <User className="h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  sidebarData: SidebarData;
  user: SessionUser | null;
}

export function Sidebar({ mobileOpen, onMobileClose, sidebarData, user }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r border-border bg-sidebar transition-all duration-200 shrink-0',
          collapsed ? 'w-14' : 'w-56'
        )}
      >
        <div
          className={cn(
            'flex px-3 pt-2.5 pb-1',
            collapsed ? 'justify-center' : 'justify-end'
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
        <SidebarContent collapsed={collapsed} sidebarData={sidebarData} user={user} />
      </aside>

      {/* Mobile Sheet */}
      <Sheet open={mobileOpen} onOpenChange={onMobileClose}>
        <SheetContent side="left" className="w-56 p-0 bg-sidebar">
          <div className="pt-10">
            <SidebarContent sidebarData={sidebarData} user={user} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
