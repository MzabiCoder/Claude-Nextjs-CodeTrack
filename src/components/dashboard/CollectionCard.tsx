'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Star, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import NextLink from 'next/link';
import { motion } from 'framer-motion';
import { interactiveSubtleProps } from '@/components/motion/variants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { CollectionFormDialog } from '@/components/shared/CollectionFormDialog';
import { type CollectionForCard } from '@/lib/db/collections';
import { toggleFavoriteCollection } from '@/actions/collections';
import { ITEM_TYPE_ICON_MAP } from '@/lib/constants/item-types';

export function CollectionCard({
  collection,
  href,
}: {
  collection: CollectionForCard;
  href?: string;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(collection.isFavorite);

  const style = { borderLeftColor: collection.dominantColor };

  async function handleFavorite() {
    const prev = isFavorite;
    setIsFavorite(!prev);
    const result = await toggleFavoriteCollection(collection.id);
    if (!result.success) {
      setIsFavorite(prev);
      toast.error('Failed to update favorite');
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/collections/${collection.id}`, { method: 'DELETE' });
      if (!res.ok) {
        toast.error('Failed to delete collection');
        return;
      }
      toast.success('Collection deleted');
      router.refresh();
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  const cardBody = (
    <>
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="truncate font-semibold tracking-tight">{collection.name}</h3>
        <div className="flex shrink-0 items-center gap-2">
          {isFavorite && (
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          )}
          <span className="whitespace-nowrap rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[11px] tabular-nums text-muted-foreground">
            {collection.itemCount} {collection.itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      {collection.description && (
        <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {collection.description}
        </p>
      )}

      {collection.typeIcons.length > 0 && (
        <div className="mt-auto flex items-center gap-2">
          {collection.typeIcons.map((type) => {
            const Icon = ITEM_TYPE_ICON_MAP[type.icon];
            return Icon ? (
              <Icon key={type.id} className="h-4 w-4" style={{ color: type.color }} aria-hidden="true" />
            ) : null;
          })}
        </div>
      )}
    </>
  );

  return (
    <>
      <motion.div
        {...interactiveSubtleProps}
        className="group relative h-full rounded-2xl border border-l-[3px] border-border bg-card/80 backdrop-blur-sm shadow-ambient transition-colors hover:bg-accent/40 hover:shadow-lifted"
        style={style}
      >
        {href ? (
          <NextLink href={href} className="flex h-full flex-col p-4 sm:p-5">
            {cardBody}
          </NextLink>
        ) : (
          <div className="flex h-full flex-col p-4 sm:p-5">{cardBody}</div>
        )}

        <div
          className="absolute bottom-2 right-2 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:h-8 sm:w-8"
              aria-label="Collection options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-amber-500 focus:text-amber-500"
                onClick={handleFavorite}
              >
                <Star className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'Unfavorite' : 'Favorite'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      <CollectionFormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        collection={collection}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete "${collection.name}"?`}
        description="This will remove the collection and all its item memberships. Items themselves will not be deleted."
        loading={deleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
