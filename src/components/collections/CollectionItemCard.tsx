'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Code, MoreHorizontal, Pencil, Trash2, Star } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { ItemCardBody } from '@/components/shared/ItemCardBody';
import { EditItemDialog } from './EditItemDialog';
import { toggleFavoriteItem } from '@/actions/items';
import { type ItemForCard } from '@/lib/db/items';
import { ITEM_TYPE_ICON_MAP } from '@/lib/constants/item-types';

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

  const Icon = ITEM_TYPE_ICON_MAP[item.itemType.icon] ?? Code;
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
        <ItemCardBody
          icon={Icon}
          color={color}
          title={item.title}
          description={item.description}
          isFavorite={isFavorite}
          typeName={item.itemType.name}
          tags={item.tags}
        />

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

      <ConfirmDeleteDialog
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        title={`Remove "${item.title}"?`}
        description="This removes the item from this collection. The item itself will not be deleted."
        confirmLabel="Remove"
        loadingLabel="Removing…"
        loading={removing}
        onConfirm={handleRemove}
      />
    </>
  );
}
