import { Search, Plus, FolderPlus, LayoutGrid, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TopBarProps {
  onMobileMenuClick?: () => void;
}

export function TopBar({ onMobileMenuClick }: TopBarProps) {
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
          <Input className="pl-9" placeholder="Search items..." />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Button variant="outline" className="hidden sm:flex">
          <FolderPlus className="h-4 w-4" />
          New Collection
        </Button>
        <Button>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Item</span>
        </Button>
      </div>
    </header>
  );
}
