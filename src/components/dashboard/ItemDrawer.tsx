'use client';

import { useEffect, useState } from 'react';
import { Code, Sparkles, Terminal, StickyNote, File, Image, Link, Star, Pin, Copy, Pencil, Trash2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const ICON_MAP: Record<string, LucideIcon> = {
  Code, Sparkles, Terminal, StickyNote, File, Image, Link,
};

type ItemDetailResponse = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  language: string | null;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  itemType: { name: string; icon: string; color: string };
  collections: { id: string; name: string }[];
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className ?? ''}`} />;
}

function DrawerSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="flex gap-2 pt-2 border-t border-border">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-14" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-14" />
      </div>
      <div className="pt-2 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-3 w-24 mt-4" />
        <Skeleton className="h-28 w-full" />
      </div>
    </div>
  );
}

interface ItemDrawerProps {
  open: boolean;
  onClose: () => void;
  itemId: string | null;
}

export function ItemDrawer({ open, onClose, itemId }: ItemDrawerProps) {
  const [item, setItem] = useState<ItemDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !itemId) return;
    setLoading(true);
    setItem(null);
    fetch(`/api/items/${itemId}`)
      .then((r) => r.json())
      .then((data) => setItem(data))
      .finally(() => setLoading(false));
  }, [open, itemId]);

  const Icon = item ? (ICON_MAP[item.itemType.icon] ?? Code) : null;
  const color = item?.itemType.color ?? '#3b82f6';

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <SheetContent side="right" className="overflow-y-auto gap-0 p-0">
        {loading ? (
          <>
            <SheetTitle className="sr-only">Loading item</SheetTitle>
            <DrawerSkeleton />
          </>
        ) : item ? (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 pb-3 border-b border-border pr-10">
              <div className="flex items-center gap-2 mb-2">
                {Icon && (
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                )}
                <SheetTitle className="text-base font-semibold leading-snug">
                  {item.title}
                </SheetTitle>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className="rounded px-1.5 py-0.5 text-xs font-medium capitalize"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  {item.itemType.name}
                </span>
                {item.language && (
                  <span className="rounded px-1.5 py-0.5 text-xs bg-muted text-muted-foreground">
                    {item.language}
                  </span>
                )}
              </div>
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-border">
              <Button
                variant="ghost"
                size="sm"
                className={item.isFavorite ? 'text-yellow-400 hover:text-yellow-400' : ''}
              >
                <Star className={`h-4 w-4 ${item.isFavorite ? 'fill-yellow-400' : ''}`} />
                Favorite
              </Button>
              <Button variant="ghost" size="sm">
                <Pin className="h-4 w-4" />
                Pin
              </Button>
              <Button variant="ghost" size="sm">
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              <Button variant="ghost" size="sm">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {item.description && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Description
                  </h3>
                  <p className="text-sm">{item.description}</p>
                </section>
              )}

              {item.content && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Content
                  </h3>
                  <pre className="text-xs bg-muted rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-words leading-relaxed">
                    {item.content}
                  </pre>
                </section>
              )}

              {item.url && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    URL
                  </h3>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:underline break-all"
                  >
                    {item.url}
                  </a>
                </section>
              )}

              {item.tags.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded px-1.5 py-0.5 text-xs bg-muted text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {item.collections.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Collections
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {item.collections.map((col) => (
                      <span
                        key={col.id}
                        className="rounded px-1.5 py-0.5 text-xs bg-muted text-muted-foreground"
                      >
                        {col.name}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Details
                </h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Created</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Updated</span>
                    <span>{formatDate(item.updatedAt)}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
