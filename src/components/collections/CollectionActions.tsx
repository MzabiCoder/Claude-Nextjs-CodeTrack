'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Pencil, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { CollectionFormDialog } from '@/components/shared/CollectionFormDialog';
import { toggleFavoriteCollection } from '@/actions/collections';

interface CollectionActionsProps {
  collection: { id: string; name: string; description: string | null; isFavorite: boolean };
}

export function CollectionActions({ collection }: CollectionActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(collection.isFavorite);

  async function handleFavorite() {
    const prev = isFavorite;
    setIsFavorite(!prev);
    const result = await toggleFavoriteCollection(collection.id);
    if (!result.success) {
      setIsFavorite(prev);
      toast.error('Failed to update favorite');
    } else {
      router.refresh();
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
      router.push('/collections');
      router.refresh();
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${isFavorite ? 'text-yellow-400 hover:text-yellow-400' : 'text-muted-foreground hover:text-yellow-400'}`}
          aria-label={isFavorite ? 'Unfavorite' : 'Favorite'}
          onClick={handleFavorite}
        >
          <Star
            className="h-4 w-4"
            fill={isFavorite ? 'currentColor' : 'none'}
          />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label="Edit collection"
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          aria-label="Delete collection"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

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
