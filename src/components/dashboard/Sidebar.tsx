'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Code, Sparkles, Terminal, StickyNote, File, Image as ImageIcon,
  Link as LinkIcon, PanelLeftClose, PanelLeftOpen, Star, ChevronDown, LogOut, User, Settings,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { staggerContainerTight, staggerItem, tapSpring } from '@/components/motion/variants';
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

function SidebarCollections({ collections }: { collections: SidebarData['collections'] }) {
  const [open, setOpen] = useState(true);
  const favorites = collections.filter((c) => c.isFavorite);
  const recent = collections.filter((c) => !c.isFavorite);

  return (
    <div className="flex-1 border-t border-border px-3 pt-4">
      <button
        onClick={() => setOpen(!open)}
        className="group mb-2 flex w-full items-center gap-1.5 px-2"
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors group-hover:text-foreground">
          Collections
        </span>
        <ChevronDown
          className={cn(
            'h-3 w-3 text-muted-foreground group-hover:text-foreground transition-all duration-200',
            !open && '-rotate-90'
          )}
        />
      </button>

      {open && (
        <>
          {favorites.length > 0 && (
            <div className="mb-3">
              <p className="mb-1 px-2 text-[11px] font-medium text-muted-foreground/80">Favorites</p>
              <nav className="space-y-0.5">
                {favorites.map((col) => (
                  <Link
                    key={col.id}
                    href={`/collections/${col.id}`}
                    className="flex min-h-10 items-center gap-2.5 rounded-xl px-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:min-h-9"
                  >
                    <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
                    <span className="truncate flex-1">{col.name}</span>
                    <span className="text-xs tabular-nums text-muted-foreground">{col.itemCount}</span>
                  </Link>
                ))}
              </nav>
            </div>
          )}

          {recent.length > 0 && (
            <div>
              <p className="mb-1 px-2 text-[11px] font-medium text-muted-foreground/80">Recent</p>
              <nav className="space-y-0.5">
                {recent.map((col) => (
                  <Link
                    key={col.id}
                    href={`/collections/${col.id}`}
                    className="flex min-h-10 items-center gap-2.5 rounded-xl px-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:min-h-9"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-inset ring-white/10"
                      style={{ backgroundColor: col.dominantColor }}
                    />
                    <span className="truncate flex-1">{col.name}</span>
                    <span className="text-xs tabular-nums text-muted-foreground">{col.itemCount}</span>
                  </Link>
                ))}
              </nav>
            </div>
          )}

          <Link
            href="/collections"
            className="mt-1.5 flex items-center rounded-xl px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            View all collections →
          </Link>
        </>
      )}
    </div>
  );
}

function SidebarContent({
  collapsed = false,
  sidebarData,
  user,
}: {
  collapsed?: boolean;
  sidebarData: SidebarData;
  user: SessionUser | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Item Types */}
      <div className="px-3 py-4">
        {!collapsed && (
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Types
          </p>
        )}
        <motion.nav
          variants={staggerContainerTight}
          initial="hidden"
          animate="visible"
          className="space-y-1"
        >
          {sidebarData.itemTypes.map((type) => {
            const Icon = TYPE_ICONS[type.name] ?? Code;
            const slug = TYPE_SLUGS[type.name] ?? `${type.name}s`;
            const isActive = pathname === `/items/${slug}`;
            return (
              <motion.div key={type.id} variants={staggerItem}>
                <Link
                  href={`/items/${slug}`}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'relative flex min-h-11 items-center gap-2.5 rounded-xl px-2.5 text-sm transition-colors md:min-h-9',
                    isActive
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    collapsed && 'justify-center px-0'
                  )}
                  title={collapsed ? slug : undefined}
                >
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active-pill"
                      transition={tapSpring}
                      className="absolute inset-0 -z-10 rounded-xl border border-border bg-accent shadow-ambient"
                    />
                  )}
                  <Icon
                    className="h-[17px] w-[17px] shrink-0"
                    style={{ color: type.color }}
                    aria-hidden="true"
                  />
                  {!collapsed && (
                    <>
                      <span className="capitalize">{TYPE_SLUGS[type.name] ?? `${type.name}s`}</span>
                      {(type.name === 'file' || type.name === 'image') && (
                        <Badge className="h-4 border-0 bg-gradient-brand px-1 text-[9px] font-bold leading-none tracking-wide text-white">
                          PRO
                        </Badge>
                      )}
                      <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                        {type.count}
                      </span>
                    </>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </motion.nav>
      </div>

      {/* Collections */}
      {!collapsed && <SidebarCollections collections={sidebarData.collections} />}

      {/* User */}
      <div className="mt-auto border-t border-border px-3 py-3">
        {mounted ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                'flex w-full min-h-11 items-center gap-2.5 rounded-xl px-1.5 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:min-h-10',
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
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <User className="h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => signOut({ callbackUrl: '/sign-in' })}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div
            className={cn(
              'flex items-center gap-2.5 w-full rounded-md px-1 py-1',
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
          </div>
        )}
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
          'hidden shrink-0 flex-col border-r border-border bg-sidebar/80 backdrop-blur-xl transition-[width] duration-300 ease-out md:flex',
          collapsed ? 'w-16' : 'w-60 xl:w-64'
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
            className="h-8 w-8 rounded-lg"
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
        <SheetContent side="left" className="w-[17rem] border-r border-border bg-sidebar p-0">
          <div className="pt-12">
            <SidebarContent sidebarData={sidebarData} user={user} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
