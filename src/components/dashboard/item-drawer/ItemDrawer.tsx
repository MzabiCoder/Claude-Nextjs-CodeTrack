'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Code, Sparkles, Terminal, StickyNote, File, Image, Link } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import {
  CONTENT_TYPES,
  LANGUAGE_TYPES,
  CODE_EDITOR_TYPES,
  MARKDOWN_EDITOR_TYPES,
  FILE_TYPES,
} from '@/lib/constants/item-types';
import { updateItem, deleteItem, toggleFavoriteItem, toggleItemPin } from '@/actions/items';
import { useSuggestedTags } from '@/hooks/useSuggestedTags';
import { DrawerSkeleton } from './DrawerSkeleton';
import { DrawerActionBar } from './DrawerActionBar';
import { DrawerViewBody } from './DrawerViewBody';
import { DrawerEditBody } from './DrawerEditBody';
import type { ItemDetailResponse, DrawerFormData } from './types';

const ICON_MAP: Record<string, LucideIcon> = {
  Code, Sparkles, Terminal, StickyNote, File, Image, Link,
};

interface ItemDrawerProps {
  open: boolean;
  onClose: () => void;
  itemId: string | null;
  isPro?: boolean;
}

export function ItemDrawer({ open, onClose, itemId, isPro = false }: ItemDrawerProps) {
  const router = useRouter();
  const [item, setItem] = useState<ItemDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState<DrawerFormData>({
    title: '', description: '', content: '', url: '', language: '', tags: '',
  });
  const suggestedTags = useSuggestedTags();

  useEffect(() => {
    if (!open || !itemId) return;
    setLoading(true);
    setIsEditing(false);
    setItem(null);
    fetch(`/api/items/${itemId}`)
      .then((r) => r.json())
      .then((data) => { if (data?.itemType) setItem(data); })
      .finally(() => setLoading(false));
  }, [open, itemId]);

  function handleClose() {
    setIsEditing(false);
    setDeleteOpen(false);
    suggestedTags.reset();
    onClose();
  }

  async function handleFavorite() {
    if (!item) return;
    const prev = item.isFavorite;
    setItem((i) => i ? { ...i, isFavorite: !i.isFavorite } : i);
    const result = await toggleFavoriteItem(item.id);
    if (!result.success) {
      setItem((i) => i ? { ...i, isFavorite: prev } : i);
      toast.error('Failed to update favorite');
    } else {
      router.refresh();
    }
  }

  async function handlePin() {
    if (!item) return;
    const prev = item.isPinned;
    setItem((i) => i ? { ...i, isPinned: !i.isPinned } : i);
    const result = await toggleItemPin(item.id);
    if (!result.success) {
      setItem((i) => i ? { ...i, isPinned: prev } : i);
      toast.error('Failed to update pin');
    } else {
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!item) return;
    setDeleting(true);
    try {
      const result = await deleteItem(item.id);
      if (!result.success) { toast.error(result.error); return; }
      setDeleteOpen(false);
      onClose();
      toast.success('Item deleted');
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  function enterEditMode() {
    if (!item) return;
    setFormData({
      title: item.title,
      description: item.description ?? '',
      content: item.content ?? '',
      url: item.url ?? '',
      language: item.language ?? '',
      tags: item.tags.join(', '),
    });
    setSelectedCollectionIds(item.collections.map((c) => c.id));
    setIsEditing(true);
  }

  function updateField(field: keyof DrawerFormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSave() {
    if (!item) return;
    setSaving(true);
    try {
      const tags = formData.tags.split(',').map((t) => t.trim()).filter(Boolean);
      const result = await updateItem(item.id, {
        title: formData.title,
        description: formData.description || null,
        content: formData.content || null,
        url: formData.url || null,
        language: formData.language || null,
        tags,
        collectionIds: selectedCollectionIds,
      });
      if (!result.success) { toast.error(result.error); return; }
      const refreshed = await fetch(`/api/items/${item.id}`).then((r) => r.json());
      setItem(refreshed);
      setIsEditing(false);
      toast.success('Item updated');
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const Icon = item ? (ICON_MAP[item.itemType.icon] ?? Code) : null;
  const color = item?.itemType.color ?? '#3b82f6';
  const typeName = item?.itemType.name ?? '';
  const showContent = CONTENT_TYPES.has(typeName);
  const showLanguage = LANGUAGE_TYPES.has(typeName);
  const showUrl = typeName === 'link';
  const isFileType = FILE_TYPES.has(typeName);
  const useCodeEditor = CODE_EDITOR_TYPES.has(typeName);
  const useMarkdownEditor = MARKDOWN_EDITOR_TYPES.has(typeName);

  return (
    <>
      <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
        <SheetContent side="right" className="overflow-y-auto gap-0 p-0">
          {loading ? (
            <>
              <SheetTitle className="sr-only">Loading item</SheetTitle>
              <DrawerSkeleton />
            </>
          ) : item ? (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 pb-3 border-b border-border pr-10">
                <div className="flex items-center gap-2 mb-2">
                  {Icon && (
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                      style={{ backgroundColor: `${color}20`, color }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  )}
                  {isEditing ? (
                    <Input
                      value={formData.title}
                      onChange={updateField('title')}
                      className="text-base font-semibold h-auto py-0.5 px-1.5"
                      placeholder="Item title"
                      autoFocus
                    />
                  ) : (
                    <SheetTitle className="text-base font-semibold leading-snug">
                      {item.title}
                    </SheetTitle>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className="rounded px-1.5 py-0.5 text-xs font-medium capitalize"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    {item.itemType.name}
                  </span>
                  {!isEditing && item.language && (
                    <span className="rounded px-1.5 py-0.5 text-xs bg-muted text-muted-foreground">
                      {item.language}
                    </span>
                  )}
                </div>
              </div>

              <DrawerActionBar
                isEditing={isEditing}
                saving={saving}
                isTitleEmpty={!formData.title.trim()}
                isFavorite={item.isFavorite}
                isPinned={item.isPinned}
                isFileType={isFileType}
                fileUrl={item.fileUrl}
                itemId={item.id}
                copyText={item.content ?? item.url ?? null}
                onSave={handleSave}
                onCancel={() => { setIsEditing(false); suggestedTags.reset(); }}
                onEdit={enterEditMode}
                onDeleteClick={() => setDeleteOpen(true)}
                onFavoriteClick={handleFavorite}
                onPinClick={handlePin}
              />

              {isEditing ? (
                <DrawerEditBody
                  formData={formData}
                  showContent={showContent}
                  showLanguage={showLanguage}
                  showUrl={showUrl}
                  useCodeEditor={useCodeEditor}
                  useMarkdownEditor={useMarkdownEditor}
                  selectedCollectionIds={selectedCollectionIds}
                  onCollectionChange={setSelectedCollectionIds}
                  createdAt={item.createdAt}
                  updatedAt={item.updatedAt}
                  updateField={updateField}
                  onContentChange={(v) => setFormData((prev) => ({ ...prev, content: v }))}
                  onLanguageChange={(v) => setFormData((prev) => ({ ...prev, language: v }))}
                  onTagsChange={(v) => setFormData((prev) => ({ ...prev, tags: v }))}
                  isPro={isPro}
                  suggestedTags={suggestedTags.suggestedTags}
                  loadingTags={suggestedTags.loading}
                  onSuggestTags={() =>
                    suggestedTags.suggest({
                      title: formData.title,
                      content: formData.content,
                      typeName,
                      currentTags: formData.tags,
                    })
                  }
                  onAcceptTag={(tag) => suggestedTags.accept(tag, formData.tags, (v) => setFormData((prev) => ({ ...prev, tags: v })))}
                  onRejectTag={suggestedTags.reject}
                />
              ) : (
                <DrawerViewBody
                  item={item}
                  typeName={typeName}
                  useCodeEditor={useCodeEditor}
                  useMarkdownEditor={useMarkdownEditor}
                />
              )}
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete item?"
        description={
          <>
            <span className="font-medium text-foreground">{item?.title}</span> will be permanently
            deleted. This cannot be undone.
          </>
        }
        loading={deleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
