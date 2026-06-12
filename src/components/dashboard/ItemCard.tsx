'use client';

import { useState } from 'react';
import { Code, Sparkles, Terminal, StickyNote, File, Image, Link, Pin, Star, Copy, Check } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import { type ItemForCard } from '@/lib/db/items';
import { formatDateCompact } from '@/lib/format';
import { useItemDrawer } from '@/components/dashboard/ItemDrawerContext';

const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link,
};


function copyValue(item: ItemForCard): string | null {
  if (item.itemType.name === 'link') return item.url;
  return item.content;
}

export function ItemCard({ item }: { item: ItemForCard }) {
  const { openDrawer } = useItemDrawer();
  const Icon = ICON_MAP[item.itemType.icon] ?? Code;
  const color = item.itemType.color;
  const [copied, setCopied] = useState(false);

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    const value = copyValue(item);
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div
      className="flex items-start gap-4 rounded-lg border border-l-4 bg-card p-4 hover:bg-accent/50 transition-colors cursor-pointer group"
      style={{ borderLeftColor: color }}
      onClick={() => openDrawer(item.id)}
    >
      <div
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: `${color}20`, color }}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium truncate">{item.title}</span>
          {item.isFavorite && <Star className="h-3 w-3 shrink-0 fill-yellow-400 text-yellow-400" />}
          {item.isPinned && <Pin className="h-3 w-3 shrink-0 text-muted-foreground" />}
        </div>

        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{item.description}</p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="rounded px-1.5 py-0.5 text-xs font-medium"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {item.itemType.name}
          </span>
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded px-1.5 py-0.5 text-xs bg-muted text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="shrink-0 flex flex-col items-end gap-2">
        <span className="text-xs text-muted-foreground">{formatDateCompact(item.createdAt)}</span>
        {copyValue(item) && (
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
            aria-label="Copy content"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}
