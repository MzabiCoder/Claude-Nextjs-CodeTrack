'use client';

import { useState } from 'react';
import { File, FileText, FileCode, Download, Copy, Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { type ItemForCard } from '@/lib/db/items';
import { formatBytes, formatDate } from '@/lib/format';
import { useItemDrawer } from '@/components/dashboard/ItemDrawerContext';
import { buttonVariants } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { tapSpring } from '@/components/motion/variants';

const FILE_COLOR = '#6366f1';

function iconForFile(fileName: string | null): LucideIcon {
  const ext = fileName?.split('.').pop()?.toLowerCase() ?? '';
  if (['txt', 'md', 'csv', 'pdf'].includes(ext)) return FileText;
  if (['json', 'yaml', 'yml', 'toml', 'xml', 'ini'].includes(ext)) return FileCode;
  return File;
}


export function FileRow({ item }: { item: ItemForCard }) {
  const { openDrawer } = useItemDrawer();
  const Icon = iconForFile(item.fileName);
  const showSecondaryName = item.fileName && item.fileName !== item.title;
  const [copied, setCopied] = useState(false);

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    if (!item.fileUrl) return;
    navigator.clipboard.writeText(item.fileUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <motion.div
      whileHover={{ x: 2 }}
      transition={tapSpring}
      className="flex cursor-pointer items-center gap-3 bg-card/70 px-3 py-3 backdrop-blur-sm transition-colors hover:bg-accent/40 sm:px-4"
      onClick={() => openDrawer(item.id)}
    >
      {/* File type icon */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${FILE_COLOR}1f`, color: FILE_COLOR }}
      >
        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      </div>

      {/* Title + actual filename */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-semibold tracking-tight">{item.title}</p>
        {showSecondaryName && (
          <p className="text-xs text-muted-foreground truncate">{item.fileName}</p>
        )}
        {/* Mobile-only: size + date below name */}
        <p className="text-xs text-muted-foreground sm:hidden mt-0.5">
          {formatBytes(item.fileSize)} · {formatDate(item.createdAt)}
        </p>
      </div>

      {/* Desktop: size + date as columns */}
      <div className="hidden shrink-0 items-center gap-6 sm:flex">
        <span className="w-20 text-right text-sm tabular-nums text-muted-foreground">
          {formatBytes(item.fileSize)}
        </span>
        <span className="w-28 text-right text-sm text-muted-foreground">
          {formatDate(item.createdAt)}
        </span>
      </div>

      {/* Copy URL button */}
      {item.fileUrl && (
        <button
          className={buttonVariants({ variant: 'ghost', size: 'icon-sm' }) + ' tap-target rounded-xl sm:min-h-8 sm:min-w-8'}
          onClick={handleCopy}
          aria-label="Copy file URL"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
        </button>
      )}

      {/* Download button */}
      <a
        href={`/api/download/${item.id}`}
        download
        className={buttonVariants({ variant: 'ghost', size: 'icon-sm' }) + ' tap-target rounded-xl sm:min-h-8 sm:min-w-8'}
        onClick={(e) => e.stopPropagation()}
        aria-label={`Download ${item.title}`}
      >
        <Download className="h-4 w-4" />
      </a>
    </motion.div>
  );
}
