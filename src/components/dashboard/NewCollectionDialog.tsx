'use client';

import { useState } from 'react';
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

interface NewCollectionDialogProps {
  open: boolean;
  onClose: () => void;
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
      {children}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </label>
  );
}

export function NewCollectionDialog({ open, onClose }: NewCollectionDialogProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  function handleClose() {
    setName('');
    setDescription('');
    onClose();
  }

  async function handleSubmit() {
    setSaving(true);
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: description || null }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? 'Failed to create collection');
        return;
      }

      toast.success('Collection created');
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
          <DialogTitle>New Collection</DialogTitle>
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
            {saving ? 'Creating…' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
