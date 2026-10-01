'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { interactiveSubtleProps } from '@/components/motion/variants';
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
    <motion.div
      role="button"
      tabIndex={0}
      {...interactiveSubtleProps}
      className="group flex w-full cursor-pointer items-start gap-3.5 rounded-2xl border border-l-[3px] border-border bg-card/80 p-4 text-left backdrop-blur-sm shadow-ambient transition-colors hover:bg-accent/40 hover:shadow-lifted sm:gap-4 sm:p-5"
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

      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="whitespace-nowrap text-xs text-muted-foreground">{formatDateCompact(item.createdAt)}</span>
        {copyValue(item) && (
          <button
            onClick={handleCopy}
            className="rounded-lg p-2 text-muted-foreground transition-opacity hover:bg-muted hover:text-foreground sm:p-1.5 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
            aria-label="Copy content"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          </button>
        )}
      </div>
    </motion.div>
  );
}
