import { Code, Sparkles, Terminal, StickyNote, File, Image, Link, Pin } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import { type ItemForCard } from '@/lib/db/items';

const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link,
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ItemCard({ item }: { item: ItemForCard }) {
  const Icon = ICON_MAP[item.itemType.icon] ?? Code;
  const color = item.itemType.color;

  return (
    <div className="flex items-start gap-4 rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors cursor-pointer">
      <div
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: `${color}20`, color }}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium truncate">{item.title}</span>
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

      <span className="shrink-0 text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
    </div>
  );
}
