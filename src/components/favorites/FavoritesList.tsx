'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Code, Folder, Star } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FavoritesData, FavoriteItem, FavoriteCollection } from '@/lib/db/favorites';
import { useItemDrawer } from '@/components/dashboard/ItemDrawerContext';
import { formatDateCompact } from '@/lib/format';
import { ITEM_TYPE_ICON_MAP } from '@/lib/constants/item-types';

type ItemSortKey = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'type-asc';
type CollectionSortKey = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc';

function sortItems(items: FavoriteItem[], sort: ItemSortKey): FavoriteItem[] {
  return [...items].sort((a, b) => {
    switch (sort) {
      case 'date-desc': return b.updatedAt.getTime() - a.updatedAt.getTime();
      case 'date-asc':  return a.updatedAt.getTime() - b.updatedAt.getTime();
      case 'name-asc':  return a.title.localeCompare(b.title);
      case 'name-desc': return b.title.localeCompare(a.title);
      case 'type-asc':  return a.itemType.name.localeCompare(b.itemType.name);
    }
  });
}

function sortCollections(cols: FavoriteCollection[], sort: CollectionSortKey): FavoriteCollection[] {
  return [...cols].sort((a, b) => {
    switch (sort) {
      case 'date-desc': return b.updatedAt.getTime() - a.updatedAt.getTime();
      case 'date-asc':  return a.updatedAt.getTime() - b.updatedAt.getTime();
      case 'name-asc':  return a.name.localeCompare(b.name);
      case 'name-desc': return b.name.localeCompare(a.name);
    }
  });
}

export function FavoritesList({ data }: { data: FavoritesData }) {
  const { openDrawer } = useItemDrawer();
  const router = useRouter();
  const [itemSort, setItemSort] = useState<ItemSortKey>('date-desc');
  const [colSort, setColSort] = useState<CollectionSortKey>('date-desc');

  const sortedItems = useMemo(() => sortItems(data.items, itemSort), [data.items, itemSort]);
  const sortedCollections = useMemo(() => sortCollections(data.collections, colSort), [data.collections, colSort]);

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
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Items — {data.items.length}
            </p>
            <Select value={itemSort} onValueChange={(v) => setItemSort(v as ItemSortKey)}>
              <SelectTrigger className="h-7 w-40 text-xs font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc" className="text-xs font-mono">Date: newest</SelectItem>
                <SelectItem value="date-asc" className="text-xs font-mono">Date: oldest</SelectItem>
                <SelectItem value="name-asc" className="text-xs font-mono">Name: A → Z</SelectItem>
                <SelectItem value="name-desc" className="text-xs font-mono">Name: Z → A</SelectItem>
                <SelectItem value="type-asc" className="text-xs font-mono">Type</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="divide-y divide-border border border-border rounded-md overflow-hidden">
            {sortedItems.map((item) => {
              const Icon = ITEM_TYPE_ICON_MAP[item.itemType.icon] ?? Code;
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
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Collections — {data.collections.length}
            </p>
            <Select value={colSort} onValueChange={(v) => setColSort(v as CollectionSortKey)}>
              <SelectTrigger className="h-7 w-40 text-xs font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc" className="text-xs font-mono">Date: newest</SelectItem>
                <SelectItem value="date-asc" className="text-xs font-mono">Date: oldest</SelectItem>
                <SelectItem value="name-asc" className="text-xs font-mono">Name: A → Z</SelectItem>
                <SelectItem value="name-desc" className="text-xs font-mono">Name: Z → A</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="divide-y divide-border border border-border rounded-md overflow-hidden">
            {sortedCollections.map((col) => (
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
