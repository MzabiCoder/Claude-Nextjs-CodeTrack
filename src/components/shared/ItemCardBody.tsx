import { Star, Pin } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ItemCardBodyProps {
  icon: LucideIcon;
  color: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned?: boolean;
  typeName: string;
  tags: string[];
}

export function ItemCardBody({
  icon: Icon,
  color,
  title,
  description,
  isFavorite,
  isPinned,
  typeName,
  tags,
}: ItemCardBodyProps) {
  return (
    <>
      <div
        className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
        style={{ backgroundColor: `${color}1f`, color }}
      >
        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="truncate font-semibold tracking-tight">{title}</span>
          {isFavorite && <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />}
          {isPinned && <Pin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
        </div>

        {description && (
          <p className="mb-2.5 line-clamp-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize"
            style={{ backgroundColor: `${color}1f`, color }}
          >
            {typeName}
          </span>
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-border bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
