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
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: `${color}20`, color }}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium truncate">{title}</span>
          {isFavorite && <Star className="h-3 w-3 shrink-0 fill-yellow-400 text-yellow-400" />}
          {isPinned && <Pin className="h-3 w-3 shrink-0 text-muted-foreground" />}
        </div>

        {description && (
          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{description}</p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="rounded px-1.5 py-0.5 text-xs font-medium"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {typeName}
          </span>
          {tags.map((tag) => (
            <span key={tag} className="rounded px-1.5 py-0.5 text-xs bg-muted text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
