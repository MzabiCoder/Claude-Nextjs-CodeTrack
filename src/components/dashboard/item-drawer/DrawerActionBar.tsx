'use client';

import { useState } from 'react';
import { Star, Pin, Copy, Pencil, Trash2, Check, X, Download } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';

interface DrawerActionBarProps {
  isEditing: boolean;
  saving: boolean;
  isTitleEmpty: boolean;
  isFavorite: boolean;
  isPinned: boolean;
  isFileType: boolean;
  fileUrl: string | null;
  itemId: string;
  copyText: string | null;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onDeleteClick: () => void;
  onFavoriteClick: () => void;
  onPinClick: () => void;
}

export function DrawerActionBar({
  isEditing, saving, isTitleEmpty, isFavorite, isPinned,
  isFileType, fileUrl, itemId, copyText,
  onSave, onCancel, onEdit, onDeleteClick, onFavoriteClick, onPinClick,
}: DrawerActionBarProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!copyText) return;
    await navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-border">
      {isEditing ? (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSave}
            disabled={saving || isTitleEmpty}
            className="text-green-400 hover:text-green-400"
          >
            <Check className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save'}
          </Button>
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </>
      ) : (
        <>
          <Button
            variant="ghost"
            size="sm"
            className={isFavorite ? 'text-yellow-400 hover:text-yellow-400' : ''}
            onClick={onFavoriteClick}
          >
            <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-400' : ''}`} />
            Favorite
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={isPinned ? 'text-blue-400 hover:text-blue-400' : ''}
            onClick={onPinClick}
          >
            <Pin className={`h-4 w-4 ${isPinned ? 'fill-blue-400' : ''}`} />
            Pin
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!copyText}>
            <Copy className={`h-4 w-4 ${copied ? 'text-green-400' : ''}`} />
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          {isFileType && fileUrl && (
            <a
              href={`/api/download/${itemId}`}
              download
              className={buttonVariants({ variant: 'ghost', size: 'sm' })}
            >
              <Download className="h-4 w-4" />
              Download
            </a>
          )}
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-destructive hover:text-destructive"
            onClick={onDeleteClick}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </>
      )}
    </div>
  );
}
