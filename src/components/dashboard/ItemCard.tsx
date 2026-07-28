'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { type ItemForCard } from '@/lib/db/items';
import { formatDateCompact } from '@/lib/format';
import { useItemDrawer } from '@/components/dashboard/ItemDrawerContext';
import { ITEM_TYPE_ICON_MAP } from '@/lib/constants/item-types';
import { ItemCardBody } from '@/components/shared/ItemCardBody';

function copyValue(item: ItemForCard): string | null {
  if (item.itemType.name === 'link') return item.url;
  return item.content;
}

export function ItemCard({ item }: { item: ItemForCard }) {
  const { openDrawer } = useItemDrawer();
  const Icon = ITEM_TYPE_ICON_MAP[item.itemType.icon] ?? ITEM_TYPE_ICON_MAP.Code;
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
      role="button"
      tabIndex={0}
      className="flex w-full text-left items-start gap-4 rounded-lg border border-l-4 bg-card p-4 hover:bg-accent/50 transition-colors group cursor-pointer"
      style={{ borderLeftColor: color }}
      onClick={() => openDrawer(item.id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDrawer(item.id); } }}
    >
      <ItemCardBody
        icon={Icon}
        color={color}
        title={item.title}
        description={item.description}
        isFavorite={item.isFavorite}
        isPinned={item.isPinned}
        typeName={item.itemType.name}
        tags={item.tags}
      />

      <div className="shrink-0 flex flex-col items-end gap-2">
        <span className="text-xs text-muted-foreground">{formatDateCompact(item.createdAt)}</span>
        {copyValue(item) && (
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
            aria-label="Copy content"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}
