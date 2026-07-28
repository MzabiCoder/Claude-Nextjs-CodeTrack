'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyTypeStateProps {
  type: string;
}

export function EmptyTypeState({ type }: EmptyTypeStateProps) {
  function openNewItemDialog() {
    window.dispatchEvent(new CustomEvent('open-new-item-dialog'));
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-muted-foreground mb-4">No {type} yet.</p>
      <Button variant="outline" size="sm" onClick={openNewItemDialog}>
        <Plus className="h-4 w-4 mr-1.5" />
        New Item
      </Button>
    </div>
  );
}
