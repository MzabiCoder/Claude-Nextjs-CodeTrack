import { Star, Code, Sparkles, Terminal, StickyNote, File, Image, Link as LinkIcon } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import NextLink from 'next/link';
import { type CollectionForCard } from '@/lib/db/collections';

const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
};

const cardClassName =
  'rounded-lg border border-l-4 bg-card p-4 hover:bg-accent/50 transition-colors cursor-pointer block';

export function CollectionCard({
  collection,
  href,
}: {
  collection: CollectionForCard;
  href?: string;
}) {
  const style = { borderLeftColor: collection.dominantColor };

  const content = (
    <>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium truncate">{collection.name}</h3>
        <div className="flex items-center gap-2 shrink-0">
          {collection.isFavorite && (
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          )}
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {collection.itemCount} {collection.itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      {collection.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {collection.description}
        </p>
      )}

      {collection.typeIcons.length > 0 && (
        <div className="flex items-center gap-1.5 mt-auto">
          {collection.typeIcons.map((type) => {
            const Icon = ICON_MAP[type.icon];
            return Icon ? (
              <Icon key={type.id} className="h-3.5 w-3.5" style={{ color: type.color }} />
            ) : null;
          })}
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <NextLink href={href} className={cardClassName} style={style}>
        {content}
      </NextLink>
    );
  }

  return (
    <div className={cardClassName} style={style}>
      {content}
    </div>
  );
}
