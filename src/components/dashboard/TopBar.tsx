'use client';

import { Search, Plus, FolderPlus, LayoutGrid, Menu, LogOut, User } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  onNewItemClick?: () => void;
  user: SessionUser | null;
}

export function TopBar({ onMobileMenuClick, onNewItemClick, user }: TopBarProps) {
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
        <LayoutGrid className="h-5 w-5 text-primary" />
        <span className="text-lg font-bold tracking-tight">DevStash</span>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-md px-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search items..." suppressHydrationWarning />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Button variant="outline" className="hidden sm:flex">
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
