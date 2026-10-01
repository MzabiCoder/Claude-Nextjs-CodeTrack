'use client';

import { Image as ImageIcon, Pin } from 'lucide-react';
import { type ItemForCard } from '@/lib/db/items';
import { useItemDrawer } from '@/components/dashboard/ItemDrawerContext';
import { motion } from 'framer-motion';
import { interactiveSubtleProps } from '@/components/motion/variants';

export function ImageCard({ item }: { item: ItemForCard }) {
  const { openDrawer } = useItemDrawer();

  return (
    <motion.div
      {...interactiveSubtleProps}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-sm shadow-ambient transition-shadow hover:shadow-lifted"
      onClick={() => openDrawer(item.id)}
    >
      <div className="aspect-video overflow-hidden">
        {item.fileUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.fileUrl}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <ImageIcon className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="border-t border-border px-3.5 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold tracking-tight">{item.title}</span>
          {item.isPinned && <Pin className="h-3 w-3 shrink-0 text-muted-foreground" />}
        </div>
      </div>
    </motion.div>
  );
}
