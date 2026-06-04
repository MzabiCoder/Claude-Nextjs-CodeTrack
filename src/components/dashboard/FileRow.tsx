'use client';

import { File, FileText, FileCode, Download } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { type ItemForCard } from '@/lib/db/items';
import { useItemDrawer } from '@/components/dashboard/ItemDrawerContext';
import { buttonVariants } from '@/components/ui/button';

const FILE_COLOR = '#6b7280';

function iconForFile(fileName: string | null): LucideIcon {
  const ext = fileName?.split('.').pop()?.toLowerCase() ?? '';
  if (['txt', 'md', 'csv', 'pdf'].includes(ext)) return FileText;
  if (['json', 'yaml', 'yml', 'toml', 'xml', 'ini'].includes(ext)) return FileCode;
  return File;
}

function formatBytes(bytes: number | null): string {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function FileRow({ item }: { item: ItemForCard }) {
  const { openDrawer } = useItemDrawer();
  const Icon = iconForFile(item.fileName);
  const showSecondaryName = item.fileName && item.fileName !== item.title;

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
