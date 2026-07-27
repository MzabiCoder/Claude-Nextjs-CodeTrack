'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Code, Sparkles, Terminal, StickyNote, File, Image, Link, Star, Pin, Copy, Pencil, Trash2, Check, X, Download } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LANGUAGES } from '@/lib/constants/languages';
import { updateItem, deleteItem, toggleFavoriteItem, toggleItemPin } from '@/actions/items';
import { CodeEditor } from '@/components/shared/CodeEditor';
import { MarkdownEditor } from '@/components/shared/MarkdownEditor';
import { formatBytes, formatDateLong } from '@/lib/format';
import { CollectionPicker } from '@/components/shared/CollectionPicker';

const ICON_MAP: Record<string, LucideIcon> = {
  Code, Sparkles, Terminal, StickyNote, File, Image, Link,
};

const CONTENT_TYPES = new Set(['snippet', 'prompt', 'command', 'note']);
const LANGUAGE_TYPES = new Set(['snippet', 'command']);
const CODE_EDITOR_TYPES = new Set(['snippet', 'command']);
const MARKDOWN_EDITOR_TYPES = new Set(['note', 'prompt']);
const FILE_TYPES = new Set(['file', 'image']);

type ItemDetailResponse = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  isFavorite: boolean;
  isPinned: boolean;
  language: string | null;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  itemType: { name: string; icon: string; color: string };
  collections: { id: string; name: string }[];
};

type FormData = {
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  tags: string;
};

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className ?? ''}`} />;
}

function DrawerSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="flex gap-2 pt-2 border-t border-border">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-14" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-14" />
      </div>
      <div className="pt-2 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-3 w-24 mt-4" />
        <Skeleton className="h-28 w-full" />
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
      {children}
    </h3>
  );
}

// ─── Action Bar ───────────────────────────────────────────────────────────────

interface DrawerActionBarProps {
  isEditing: boolean;
  saving: boolean;
  isTitleEmpty: boolean;
  isFavorite: boolean;
  isPinned: boolean;
  isFileType: boolean;
  fileUrl: string | null;
  itemId: string;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onDeleteClick: () => void;
  onFavoriteClick: () => void;
  onPinClick: () => void;
}

function DrawerActionBar({
  isEditing, saving, isTitleEmpty, isFavorite, isPinned,
  isFileType, fileUrl, itemId,
  onSave, onCancel, onEdit, onDeleteClick, onFavoriteClick, onPinClick,
}: DrawerActionBarProps) {
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
          <Button variant="ghost" size="sm">
            <Copy className="h-4 w-4" />
            Copy
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

// ─── View Body ────────────────────────────────────────────────────────────────

interface DrawerViewBodyProps {
  item: ItemDetailResponse;
  typeName: string;
  useCodeEditor: boolean;
  useMarkdownEditor: boolean;
}

function DrawerViewBody({ item, typeName, useCodeEditor, useMarkdownEditor }: DrawerViewBodyProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5">
      {item.description && (
        <section>
          <FieldLabel>Description</FieldLabel>
          <p className="text-sm">{item.description}</p>
        </section>
      )}

      {item.content && (
        <section>
          <FieldLabel>Content</FieldLabel>
          {useCodeEditor ? (
            <CodeEditor value={item.content} language={item.language} readOnly />
          ) : useMarkdownEditor ? (
            <MarkdownEditor key="markdown-view" value={item.content} readOnly />
          ) : (
            <pre className="text-xs bg-muted rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-words leading-relaxed">
              {item.content}
            </pre>
          )}
        </section>
      )}

      {typeName === 'image' && item.fileUrl && (
        <section>
          <FieldLabel>Image</FieldLabel>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.fileUrl}
            alt={item.title}
            className="rounded-md border border-border max-w-full object-contain max-h-80"
          />
        </section>
      )}

      {typeName === 'file' && item.fileUrl && (
        <section>
          <FieldLabel>File</FieldLabel>
          <div className="flex items-center gap-3 rounded-md border border-border bg-muted/20 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
              <File className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.fileName ?? 'File'}</p>
              {item.fileSize != null && (
                <p className="text-xs text-muted-foreground">{formatBytes(item.fileSize)}</p>
              )}
            </div>
            <a
              href={`/api/download/${item.id}`}
              download
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
          </div>
        </section>
      )}

      {item.url && (
        <section>
          <FieldLabel>URL</FieldLabel>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:underline break-all"
          >
            {item.url}
          </a>
        </section>
      )}

      {item.tags.length > 0 && (
        <section>
          <FieldLabel>Tags</FieldLabel>
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span key={tag} className="rounded px-1.5 py-0.5 text-xs bg-muted text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {item.collections.length > 0 && (
        <section>
          <FieldLabel>Collections</FieldLabel>
          <div className="flex flex-wrap gap-1.5">
            {item.collections.map((col) => (
              <span key={col.id} className="rounded px-1.5 py-0.5 text-xs bg-muted text-muted-foreground">
                {col.name}
              </span>
            ))}
          </div>
        </section>
      )}

      <section>
        <FieldLabel>Details</FieldLabel>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Created</span>
            <span>{formatDateLong(item.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span>Updated</span>
            <span>{formatDateLong(item.updatedAt)}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Edit Body ────────────────────────────────────────────────────────────────

interface DrawerEditBodyProps {
  formData: FormData;
  typeName: string;
  showContent: boolean;
  showLanguage: boolean;
  showUrl: boolean;
  useCodeEditor: boolean;
  useMarkdownEditor: boolean;
  selectedCollectionIds: string[];
  onCollectionChange: (ids: string[]) => void;
  createdAt: string;
  updatedAt: string;
  updateField: (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onContentChange: (v: string) => void;
  onLanguageChange: (v: string) => void;
}

function DrawerEditBody({
  formData, typeName, showContent, showLanguage, showUrl,
  useCodeEditor, useMarkdownEditor, selectedCollectionIds, onCollectionChange,
  createdAt, updatedAt, updateField, onContentChange, onLanguageChange,
}: DrawerEditBodyProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5">
      <section>
        <FieldLabel>Description</FieldLabel>
        <textarea
          value={formData.description}
          onChange={updateField('description')}
          placeholder="Optional description…"
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
        />
      </section>

      {showLanguage && (
        <section>
          <FieldLabel>Language</FieldLabel>
          <Select
            value={formData.language || ''}
            onValueChange={(v) => onLanguageChange(v ?? '')}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select language…" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>
      )}

      {showContent && (
        <section>
          <FieldLabel>Content</FieldLabel>
          {useCodeEditor ? (
            <CodeEditor
              value={formData.content}
              onChange={onContentChange}
              language={formData.language}
            />
          ) : useMarkdownEditor ? (
            <MarkdownEditor
              key="markdown-edit"
              value={formData.content}
              onChange={onContentChange}
              placeholder="Write markdown…"
            />
          ) : (
            <textarea
              value={formData.content}
              onChange={updateField('content')}
              placeholder="Content…"
              rows={8}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
            />
          )}
        </section>
      )}

      {showUrl && (
        <section>
          <FieldLabel>URL</FieldLabel>
          <Input value={formData.url} onChange={updateField('url')} placeholder="https://…" type="url" />
        </section>
      )}

      <section>
        <FieldLabel>Tags</FieldLabel>
        <Input value={formData.tags} onChange={updateField('tags')} placeholder="react, hooks, typescript" />
        <p className="mt-1 text-xs text-muted-foreground">Comma-separated</p>
      </section>

      <section>
        <FieldLabel>Collections</FieldLabel>
        <CollectionPicker selected={selectedCollectionIds} onChange={onCollectionChange} />
      </section>

      <section>
        <FieldLabel>Details</FieldLabel>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Created</span>
            <span>{formatDateLong(createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span>Updated</span>
            <span>{formatDateLong(updatedAt)}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ItemDrawerProps {
  open: boolean;
  onClose: () => void;
  itemId: string | null;
}

export function ItemDrawer({ open, onClose, itemId }: ItemDrawerProps) {
  const router = useRouter();
  const [item, setItem] = useState<ItemDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '', description: '', content: '', url: '', language: '', tags: '',
  });

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

  function updateField(field: keyof FormData) {
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
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
                onEdit={enterEditMode}
                onDeleteClick={() => setDeleteOpen(true)}
                onFavoriteClick={handleFavorite}
                onPinClick={handlePin}
              />

              {isEditing ? (
                <DrawerEditBody
                  formData={formData}
                  typeName={typeName}
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

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete item?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{item?.title}</span> will be permanently
              deleted. This cannot be undone.
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
