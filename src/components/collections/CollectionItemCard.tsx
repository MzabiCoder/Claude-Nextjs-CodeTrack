'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Code, Sparkles, Terminal, StickyNote, File, Image, Link,
  MoreHorizontal, Pencil, Trash2, Star,
} from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EditItemDialog } from './EditItemDialog';
import { toggleFavoriteItem } from '@/actions/items';
import { type ItemForCard } from '@/lib/db/items';

const ICON_MAP: Record<string, LucideIcon> = {
  Code, Sparkles, Terminal, StickyNote, File, Image, Link,
};

interface CollectionItemCardProps {
  item: ItemForCard;
  collectionId: string;
}

export function CollectionItemCard({ item, collectionId }: CollectionItemCardProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [isFavorite, setIsFavorite] = useState(item.isFavorite);

  const Icon = ICON_MAP[item.itemType.icon] ?? Code;
  const color = item.itemType.color;

  async function handleFavorite() {
    const result = await toggleFavoriteItem(item.id);
    if (result.success) {
      setIsFavorite(result.isFavorite);
      toast.success(result.isFavorite ? 'Added to favorites' : 'Removed from favorites');
    } else {
      toast.error(result.error);
    }
  }

  async function handleRemove() {
    setRemoving(true);
    try {
      const res = await fetch(`/api/collections/${collectionId}/items/${item.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        toast.error('Failed to remove item');
        return;
      }
      toast.success('Item removed from collection');
      router.refresh();
    } finally {
      setRemoving(false);
      setRemoveOpen(false);
    }
  }

  return (
    <>
      <div
        className="relative group flex items-start gap-4 rounded-lg border border-l-4 bg-card p-4 hover:bg-accent/50 transition-colors"
        style={{ borderLeftColor: color }}
      >
        <div
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: `${color}20`, color }}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium truncate">{item.title}</span>
            {isFavorite && <Star className="h-3 w-3 shrink-0 text-yellow-400 fill-yellow-400" />}
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

        <div
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Item options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleFavorite} className="text-yellow-500 focus:text-yellow-500">
                <Star className="h-4 w-4 mr-2" fill={isFavorite ? 'currentColor' : 'none'} />
                {isFavorite ? 'Unfavorite' : 'Favorite'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setRemoveOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove from collection
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <EditItemDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        item={{ id: item.id, title: item.title, description: item.description, tags: item.tags }}
      />

      <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove &ldquo;{item.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the item from this collection. The item itself will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={removing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removing ? 'Removing…' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
