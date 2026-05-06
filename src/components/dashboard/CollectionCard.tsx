import { Star } from 'lucide-react';

interface Collection {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
  itemCount: number;
}

export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <div className="rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors cursor-pointer">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium truncate">{collection.name}</h3>
        <div className="flex items-center gap-2 shrink-0">
          {collection.isFavorite && (
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          )}
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {collection.itemCount} items
          </span>
        </div>
      </div>
      {collection.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">{collection.description}</p>
      )}
    </div>
  );
}
