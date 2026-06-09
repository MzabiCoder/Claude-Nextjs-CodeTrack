'use client';

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { Search, Code, Sparkles, Terminal, StickyNote, File, Image, Link, FolderOpen } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import { type SearchData } from '@/lib/db/search';

const ICON_MAP: Record<string, LucideIcon> = {
  Code, Sparkles, Terminal, StickyNote, File, Image, Link,
};

export interface CommandPaletteRef {
  open: () => void;
}

interface CommandPaletteProps {
  searchData: SearchData;
  openDrawer: (id: string) => void;
}

export const CommandPalette = forwardRef<CommandPaletteRef, CommandPaletteProps>(
  function CommandPalette({ searchData, openDrawer }, ref) {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    useImperativeHandle(ref, () => ({ open: () => setOpen(true) }));

    useEffect(() => {
      function onKeyDown(e: KeyboardEvent) {
        if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          setOpen((o) => !o);
        }
      }
      document.addEventListener('keydown', onKeyDown);
      return () => document.removeEventListener('keydown', onKeyDown);
    }, []);

    function selectItem(id: string) {
      setOpen(false);
      openDrawer(id);
    }

    function selectCollection(id: string) {
      setOpen(false);
      router.push(`/collections/${id}`);
    }

    return (
      <DialogPrimitive.Root
        open={open}
        onOpenChange={(isOpen) => { if (!isOpen) setOpen(false); }}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 duration-150" />
          <DialogPrimitive.Popup className="fixed left-1/2 top-[20%] z-50 w-full max-w-xl -translate-x-1/2 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 duration-150">
            <DialogPrimitive.Title className="sr-only">Search</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Search items and collections
            </DialogPrimitive.Description>
            <Command
              className="overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl"
              loop
              filter={(value, search) => {
                if (!search.trim()) return 1;
                const terms = search.toLowerCase().trim().split(/\s+/);
                const target = value.toLowerCase();
                return terms.every((t) => target.includes(t)) ? 1 : 0;
              }}
            >
              <div className="flex items-center border-b border-border px-3">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <Command.Input
                  className="flex h-12 w-full bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
                  placeholder="Search items and collections..."
                  autoFocus
                />
              </div>

              <Command.List className="max-h-[400px] overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
                  No results found.
                </Command.Empty>

                {searchData.items.length > 0 && (
                  <Command.Group
                    heading="Items"
                    className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground"
                  >
                    {searchData.items.map((item) => {
                      const Icon = ICON_MAP[item.typeIcon] ?? Code;
                      return (
                        <Command.Item
                          key={item.id}
                          value={`${item.title} ${item.typeName} ${item.contentPreview ?? ''}`}
                          onSelect={() => selectItem(item.id)}
                          className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground outline-none"
                        >
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                            style={{ backgroundColor: `${item.typeColor}20`, color: item.typeColor }}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium leading-none">{item.title}</p>
                            {item.contentPreview && (
                              <p className="mt-1 truncate text-xs text-muted-foreground">
                                {item.contentPreview}
                              </p>
                            )}
                          </div>
                          <span
                            className="shrink-0 rounded px-1.5 py-0.5 text-xs font-medium"
                            style={{ backgroundColor: `${item.typeColor}20`, color: item.typeColor }}
                          >
                            {item.typeName}
                          </span>
                        </Command.Item>
                      );
                    })}
                  </Command.Group>
                )}

                {searchData.items.length > 0 && searchData.collections.length > 0 && (
                  <Command.Separator className="my-1 h-px bg-border" />
                )}

                {searchData.collections.length > 0 && (
                  <Command.Group
                    heading="Collections"
                    className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground"
                  >
                    {searchData.collections.map((col) => (
                      <Command.Item
                        key={col.id}
                        value={col.name}
                        onSelect={() => selectCollection(col.id)}
                        className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground outline-none"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <FolderOpen className="h-3.5 w-3.5" />
                        </div>
                        <span className="flex-1 truncate font-medium">{col.name}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {col.itemCount} {col.itemCount === 1 ? 'item' : 'items'}
                        </span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
              </Command.List>

              <div className="border-t border-border px-3 py-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span><kbd className="font-sans">↑↓</kbd> navigate</span>
                <span><kbd className="font-sans">↵</kbd> select</span>
                <span><kbd className="font-sans">Esc</kbd> close</span>
              </div>
            </Command>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    );
  }
);
