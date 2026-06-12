'use client';

import { Search, Plus, FolderPlus, LayoutGrid, Menu, LogOut, User, Star } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/shared/Avatar';
import type { SessionUser } from '@/components/dashboard/DashboardShell';

interface TopBarProps {
  onMobileMenuClick?: () => void;
  onNewCollectionClick?: () => void;
  onNewItemClick?: () => void;
  onSearchClick?: () => void;
  user: SessionUser | null;
}

export function TopBar({ onMobileMenuClick, onNewCollectionClick, onNewItemClick, onSearchClick, user }: TopBarProps) {
  return (
    <header className="relative flex items-center border-b border-border px-4 py-3">
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-8 w-8 -ml-1"
          onClick={onMobileMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <LayoutGrid className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold tracking-tight">DevStash</span>
        </Link>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-md px-4">
        <button
          onClick={onSearchClick}
          className="relative flex w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground shadow-xs hover:bg-accent/50 transition-colors"
        >
          <Search className="mr-2 h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Search items and collections...</span>
          <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Link href="/favorites">
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Favorites">
            <Star className="h-4 w-4" />
          </Button>
        </Link>
        <Button variant="outline" className="hidden sm:flex" onClick={onNewCollectionClick}>
          <FolderPlus className="h-4 w-4" />
          New Collection
        </Button>
        <Button onClick={onNewItemClick}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Item</span>
        </Button>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ml-1">
              <Avatar name={user.name} email={user.email} image={user.image} size={30} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <div className="px-1.5 py-1 border-b border-border mb-1">
                <p className="text-sm font-medium truncate">{user.name ?? "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
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
        )}
      </div>
    </header>
  );
}
