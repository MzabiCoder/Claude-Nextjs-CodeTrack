'use client';

import { useState } from 'react';
import { File, FileText, FileCode, Download, Copy, Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { type ItemForCard } from '@/lib/db/items';
import { formatBytes, formatDate } from '@/lib/format';
import { useItemDrawer } from '@/components/dashboard/ItemDrawerContext';
import { buttonVariants } from '@/components/ui/button';

const FILE_COLOR = '#6b7280';

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
    <div
      className="flex items-center gap-3 px-4 py-3 bg-card hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={() => openDrawer(item.id)}
    >
      {/* File type icon */}
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: `${FILE_COLOR}20`, color: FILE_COLOR }}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Title + actual filename */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.title}</p>
        {showSecondaryName && (
          <p className="text-xs text-muted-foreground truncate">{item.fileName}</p>
        )}
        {/* Mobile-only: size + date below name */}
        <p className="text-xs text-muted-foreground sm:hidden mt-0.5">
          {formatBytes(item.fileSize)} · {formatDate(item.createdAt)}
        </p>
      </div>

      {/* Desktop: size + date as columns */}
      <div className="hidden sm:flex items-center gap-6 shrink-0">
        <span className="text-sm text-muted-foreground w-20 text-right tabular-nums">
          {formatBytes(item.fileSize)}
        </span>
        <span className="text-sm text-muted-foreground w-28 text-right">
          {formatDate(item.createdAt)}
        </span>
      </div>

      {/* Copy URL button */}
      {item.fileUrl && (
        <button
          className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
          onClick={handleCopy}
          aria-label="Copy file URL"
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </button>
      )}

      {/* Download button */}
      <a
        href={`/api/download/${item.id}`}
        download
        className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
        onClick={(e) => e.stopPropagation()}
        aria-label={`Download ${item.title}`}
      >
        <Download className="h-4 w-4" />
      </a>
    </div>
  );
}
