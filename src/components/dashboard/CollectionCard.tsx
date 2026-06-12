'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Star, Code, Sparkles, Terminal, StickyNote, File, Image, Link as LinkIcon, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import NextLink from 'next/link';
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
import { EditCollectionDialog } from '@/components/collections/EditCollectionDialog';
import { type CollectionForCard } from '@/lib/db/collections';
import { toggleFavoriteCollection } from '@/actions/collections';

const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
};

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
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium truncate">{collection.name}</h3>
        <div className="flex items-center gap-2 shrink-0">
          {isFavorite && (
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

  return (
    <>
      <div className="relative group rounded-lg border border-l-4 bg-card hover:bg-accent/50 transition-colors" style={style}>
        {href ? (
          <NextLink href={href} className="block p-4">
            {cardBody}
          </NextLink>
        ) : (
          <div className="p-4">{cardBody}</div>
        )}

        <div
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
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
                className="text-yellow-500 focus:text-yellow-500"
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
      </div>

      <EditCollectionDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        collection={collection}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{collection.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the collection and all its item memberships. Items themselves will
              not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
