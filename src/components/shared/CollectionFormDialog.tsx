'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FieldLabel } from '@/components/shared/FieldLabel';

interface CollectionFormDialogProps {
  open: boolean;
  onClose: () => void;
  collection?: { id: string; name: string; description: string | null };
}

export function CollectionFormDialog({ open, onClose, collection }: CollectionFormDialogProps) {
  const router = useRouter();
  const isEdit = !!collection;
  const [name, setName] = useState(collection?.name ?? '');
  const [description, setDescription] = useState(collection?.description ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(collection?.name ?? '');
      setDescription(collection?.description ?? '');
    }
  }, [open, collection]);

  function handleClose() {
    if (!isEdit) {
      setName('');
      setDescription('');
    }
    onClose();
  }

  async function handleSubmit() {
    setSaving(true);
    try {
      const res = await fetch(isEdit ? `/api/collections/${collection.id}` : '/api/collections', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: description || null }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? `Failed to ${isEdit ? 'update' : 'create'} collection`);
        return;
      }

      toast.success(`Collection ${isEdit ? 'updated' : 'created'}`);
      handleClose();
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Collection' : 'New Collection'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <FieldLabel required>Name</FieldLabel>
            <Input
              placeholder="e.g. React Patterns"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && name.trim() && !saving) handleSubmit(); }}
            />
          </div>
          <div>
            <FieldLabel>Description</FieldLabel>
            <Textarea
              placeholder="Optional description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !name.trim()}>
            {saving ? (isEdit ? 'Saving…' : 'Creating…') : isEdit ? 'Save' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
