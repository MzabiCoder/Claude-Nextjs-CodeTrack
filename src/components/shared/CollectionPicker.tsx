'use client';

import { useEffect, useState } from 'react';
import { Check, ChevronsUpDown, Folder } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type Collection = { id: string; name: string };

interface CollectionPickerProps {
  selected: string[];
  onChange: (ids: string[]) => void;
}

export function CollectionPicker({ selected, onChange }: CollectionPickerProps) {
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    fetch('/api/collections')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setCollections(data); });
  }, []);

  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  }

  const selectedNames = selected
    .map((id) => collections.find((c) => c.id === id)?.name)
    .filter(Boolean);

  const label =
    selected.length === 0
      ? 'None'
      : selected.length === 1
      ? (selectedNames[0] ?? '1 selected')
      : `${selected.length} collections`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm font-normal shadow-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <span className="flex items-center gap-2 min-w-0">
          <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{label}</span>
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-64 p-1" align="start">
        {collections.length === 0 ? (
          <p className="px-2 py-3 text-sm text-center text-muted-foreground">No collections yet</p>
        ) : (
          <div className="max-h-52 overflow-y-auto">
            {collections.map((col) => {
              const checked = selected.includes(col.id);
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => toggle(col.id)}
                  className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                      checked ? 'bg-primary border-primary' : 'border-muted-foreground/50'
                    }`}
                  >
                    {checked && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <span className="truncate">{col.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
