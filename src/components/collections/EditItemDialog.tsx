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
import { updateItemBasic } from '@/actions/items';
import { FieldLabel } from '@/components/shared/FieldLabel';

interface EditItemDialogProps {
  open: boolean;
  onClose: () => void;
  item: { id: string; title: string; description: string | null; tags: string[] };
}

export function EditItemDialog({ open, onClose, item }: EditItemDialogProps) {
  const router = useRouter();
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? '');
  const [tags, setTags] = useState(item.tags.join(', '));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(item.title);
      setDescription(item.description ?? '');
      setTags(item.tags.join(', '));
    }
  }, [open, item]);

  async function handleSubmit() {
    setSaving(true);
    try {
      const parsedTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const result = await updateItemBasic(item.id, {
        title,
        description: description.trim() || null,
        tags: parsedTags,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success('Item updated');
      onClose();
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <FieldLabel required>Title</FieldLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && title.trim() && !saving) handleSubmit();
              }}
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
          <div>
            <FieldLabel>Tags</FieldLabel>
            <Input
              placeholder="react, hooks, typescript"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !title.trim()}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
