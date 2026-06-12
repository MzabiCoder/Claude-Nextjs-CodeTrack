'use client';

import { useRouter } from 'next/navigation';
import { Code, Sparkles, Terminal, StickyNote, File, Image, Link, Folder, Star } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { FavoritesData } from '@/lib/db/favorites';
import { useItemDrawer } from '@/components/dashboard/ItemDrawerContext';
import { formatDateCompact } from '@/lib/format';

const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link,
};

export function FavoritesList({ data }: { data: FavoritesData }) {
  const { openDrawer } = useItemDrawer();
  const router = useRouter();
  const hasItems = data.items.length > 0;
  const hasCollections = data.collections.length > 0;

  if (!hasItems && !hasCollections) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <Star className="h-10 w-10 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">No favorites yet.</p>
        <p className="text-xs text-muted-foreground/60">
          Star items or collections to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {hasItems && (
        <section>
          <p className="mb-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Items — {data.items.length}
          </p>
          <div className="divide-y divide-border border border-border rounded-md overflow-hidden">
            {data.items.map((item) => {
              const Icon = ICON_MAP[item.itemType.icon] ?? Code;
              const color = item.itemType.color;
              return (
                <button
                  key={item.id}
                  onClick={() => openDrawer(item.id)}
                  className="flex w-full items-center gap-3 px-3 py-2 hover:bg-accent/40 transition-colors text-left"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" style={{ color }} />
                  <span className="flex-1 min-w-0 text-sm truncate font-mono">{item.title}</span>
                  <span
                    className="shrink-0 rounded px-1.5 py-0.5 text-xs font-mono"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    {item.itemType.name}
                  </span>
                  <span className="shrink-0 text-xs font-mono text-muted-foreground w-14 text-right">
                    {formatDateCompact(item.updatedAt)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {hasCollections && (
        <section>
          <p className="mb-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Collections — {data.collections.length}
          </p>
          <div className="divide-y divide-border border border-border rounded-md overflow-hidden">
            {data.collections.map((col) => (
              <button
                key={col.id}
                onClick={() => router.push(`/collections/${col.id}`)}
                className="flex w-full items-center gap-3 px-3 py-2 hover:bg-accent/40 transition-colors text-left"
              >
                <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="flex-1 min-w-0 text-sm truncate font-mono">{col.name}</span>
                <span className="shrink-0 rounded px-1.5 py-0.5 text-xs font-mono bg-muted text-muted-foreground">
                  {col.itemCount} {col.itemCount === 1 ? 'item' : 'items'}
                </span>
                <span className="shrink-0 text-xs font-mono text-muted-foreground w-14 text-right">
                  {formatDateCompact(col.updatedAt)}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
