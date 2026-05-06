import { Search, Plus, FolderPlus, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TopBar() {
  return (
    <header className="relative flex items-center border-b border-border px-6 py-3">
      <div className="flex items-center gap-2 shrink-0">
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
        <Button variant="outline">
          <FolderPlus className="h-4 w-4" />
          New Collection
        </Button>
        <Button>
          <Plus className="h-4 w-4" />
          New Item
        </Button>
      </div>
    </header>
  );
}
