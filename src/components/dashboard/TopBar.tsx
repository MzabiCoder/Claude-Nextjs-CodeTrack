'use client';

import { Search, Plus, FolderPlus, Menu, LogOut, User, Star } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/shared/Avatar';
import { BrandMark } from '@/components/shared/BrandMark';
import { interactiveProps } from '@/components/motion/variants';
import type { SessionUser } from '@/components/dashboard/DashboardShell';

interface TopBarProps {
  onMobileMenuClick?: () => void;
  onNewCollectionClick?: () => void;
  onNewItemClick?: () => void;
  onSearchClick?: () => void;
  user: SessionUser | null;
}

export function TopBar({ onMobileMenuClick, onNewCollectionClick, onNewItemClick, onSearchClick, user }: TopBarProps) {
  const router = useRouter();

  return (
    <header className="glass-nav sticky top-0 z-30 shrink-0 border-b border-border">
      <div className="flex h-16 items-center gap-2 px-3 sm:gap-3 sm:px-5 lg:px-6">
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="tap-target -ml-1 rounded-xl md:hidden"
            onClick={onMobileMenuClick}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link
            href="/dashboard"
            className="rounded-lg transition-opacity hover:opacity-85"
            aria-label="DevCodeCave dashboard"
          >
            <BrandMark size="sm" className="hidden sm:inline-flex" />
            <BrandMark size="sm" iconOnly className="sm:hidden" />
          </Link>
        </div>

        <div className="flex min-w-0 flex-1 justify-center">
          <button
            onClick={onSearchClick}
            className="group relative flex w-full max-w-md items-center rounded-xl border border-input bg-card/60 px-3 py-2.5 text-sm text-muted-foreground backdrop-blur-sm transition-all hover:border-ring/50 hover:bg-accent/40 sm:py-2"
          >
            <Search className="mr-2 h-4 w-4 shrink-0 transition-colors group-hover:text-foreground" />
            <span className="flex-1 truncate text-left">
              <span className="hidden sm:inline">Search items and collections...</span>
              <span className="sm:hidden">Search...</span>
            </span>
            <kbd className="hidden h-5 items-center rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link href="/favorites" className="hidden sm:block">
            <Button variant="ghost" size="icon" className="tap-target rounded-xl" title="Favorites">
              <Star className="h-4 w-4" />
            </Button>
          </Link>
          {user && !user.isPro && (
            <Link href="/upgrade">
              <Button
                variant="ghost"
                className="hidden h-9 rounded-xl text-xs font-semibold text-brand-soft hover:text-foreground lg:flex"
              >
                Upgrade
              </Button>
            </Link>
          )}
          <Button variant="outline" className="hidden rounded-xl lg:flex" onClick={onNewCollectionClick}>
            <FolderPlus className="h-4 w-4" />
            New Collection
          </Button>
          <motion.div {...interactiveProps} className="hidden sm:block">
            <Button onClick={onNewItemClick} className="rounded-xl bg-gradient-brand text-white border-0 shadow-lifted">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Item</span>
            </Button>
          </motion.div>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger className="ml-0.5 rounded-full ring-offset-2 ring-offset-background transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar name={user.name} email={user.email} image={user.image} size={32} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="mb-1 border-b border-border px-1.5 py-1.5">
                  <p className="truncate text-sm font-medium">{user.name ?? "User"}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuItem onClick={() => router.push('/profile')}>
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
          )}
        </div>
      </div>
    </header>
  );
}
