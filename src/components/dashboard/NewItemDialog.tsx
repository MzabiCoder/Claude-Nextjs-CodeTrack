'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Code, Sparkles, Terminal, StickyNote, Link, File as FileIcon, Image as ImageIcon, Lock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LANGUAGES } from '@/lib/constants/languages';
import { createItem } from '@/actions/items';
import { CodeEditor } from '@/components/shared/CodeEditor';
import { MarkdownEditor } from '@/components/shared/MarkdownEditor';
import { FileUpload, type UploadResult } from '@/components/shared/FileUpload';
import { CollectionPicker } from '@/components/shared/CollectionPicker';

type TypeName = 'snippet' | 'prompt' | 'command' | 'note' | 'link' | 'file' | 'image';

const TYPES: { name: TypeName; label: string; icon: LucideIcon; color: string }[] = [
  { name: 'snippet', label: 'Snippet', icon: Code, color: '#3b82f6' },
  { name: 'prompt', label: 'Prompt', icon: Sparkles, color: '#8b5cf6' },
  { name: 'command', label: 'Command', icon: Terminal, color: '#f97316' },
  { name: 'note', label: 'Note', icon: StickyNote, color: '#fde047' },
  { name: 'link', label: 'Link', icon: Link, color: '#10b981' },
  { name: 'file', label: 'File', icon: FileIcon, color: '#6b7280' },
  { name: 'image', label: 'Image', icon: ImageIcon, color: '#ec4899' },
];

const CONTENT_TYPES = new Set<TypeName>(['snippet', 'prompt', 'command', 'note']);
const LANGUAGE_TYPES = new Set<TypeName>(['snippet', 'command']);
const CODE_EDITOR_TYPES = new Set<TypeName>(['snippet', 'command']);
const MARKDOWN_EDITOR_TYPES = new Set<TypeName>(['note', 'prompt']);
const FILE_UPLOAD_TYPES = new Set<TypeName>(['file', 'image']);

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
      {children}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </label>
  );
}

interface NewItemDialogProps {
  open: boolean;
  onClose: () => void;
  isPro?: boolean;
}

export function NewItemDialog({ open, onClose, isPro = false }: NewItemDialogProps) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<TypeName>('snippet');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [language, setLanguage] = useState('');
  const [tags, setTags] = useState('');
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [collectionIds, setCollectionIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  function handleClose() {
    setSelectedType('snippet');
    setTitle('');
    setDescription('');
    setContent('');
    setUrl('');
    setLanguage('');
    setTags('');
    setUploadResult(null);
    setCollectionIds([]);
    onClose();
  }

  function handleTypeChange(type: TypeName) {
    setSelectedType(type);
    setUploadResult(null);
  }

  async function handleSubmit() {
    setSaving(true);
    try {
      const tagList = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const result = await createItem({
        typeName: selectedType,
        title,
        description: description || null,
        content: content || null,
        url: url || null,
        language: language || null,
        tags: tagList,
        collectionIds,
        fileUrl: uploadResult?.fileUrl ?? null,
        fileName: uploadResult?.fileName ?? null,
        fileSize: uploadResult?.fileSize ?? null,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success('Item created');
      handleClose();
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const showContent = CONTENT_TYPES.has(selectedType);
  const showLanguage = LANGUAGE_TYPES.has(selectedType);
  const showUrl = selectedType === 'link';
  const showFileUpload = FILE_UPLOAD_TYPES.has(selectedType);
  const useCodeEditor = CODE_EDITOR_TYPES.has(selectedType);
  const useMarkdownEditor = MARKDOWN_EDITOR_TYPES.has(selectedType);
  const canSubmit =
    title.trim() !== '' &&
    (!showUrl || url.trim() !== '') &&
    (!showFileUpload || uploadResult !== null);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <FieldLabel>Type</FieldLabel>
            <div className="flex gap-2 flex-wrap">
              {TYPES.map(({ name, label, icon: Icon, color }) => {
                const locked = !isPro && (name === 'file' || name === 'image');
                return (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={selectedType === name}
                    title={locked ? 'Pro feature — click to upgrade' : undefined}
                    onClick={() => {
                      if (locked) {
                        handleClose();
                        router.push('/upgrade');
                      } else {
                        handleTypeChange(name);
                      }
                    }}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors border ${
                      locked
                        ? 'border-border bg-transparent text-muted-foreground opacity-40 cursor-pointer hover:opacity-60'
                        : selectedType === name
                        ? 'border-transparent'
                        : 'border-border bg-transparent text-muted-foreground hover:text-foreground'
                    }`}
                    style={
                      !locked && selectedType === name
                        ? { backgroundColor: `${color}20`, color, borderColor: `${color}40` }
                        : {}
                    }
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                    {locked && <Lock className="h-3 w-3 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <FieldLabel required>Title</FieldLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Item title"
              autoFocus
            />
          </div>

          <div>
            <FieldLabel>Description</FieldLabel>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>

          {showLanguage && (
            <div>
              <FieldLabel>Language</FieldLabel>
              <Select value={language || ''} onValueChange={(v) => setLanguage(v ?? '')}>
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
            </div>
          )}

          {showContent && (
            <div>
              <FieldLabel>Content</FieldLabel>
              {useCodeEditor ? (
                <CodeEditor
                  value={content}
                  onChange={setContent}
                  language={language}
                />
              ) : useMarkdownEditor ? (
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Write markdown…"
                />
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Content…"
                  rows={5}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                />
              )}
            </div>
          )}

          {showFileUpload && (
            <div>
              <FieldLabel required>
                {selectedType === 'image' ? 'Image' : 'File'}
              </FieldLabel>
              <FileUpload
                key={selectedType}
                itemType={selectedType as 'file' | 'image'}
                onUploadComplete={setUploadResult}
                onClear={() => setUploadResult(null)}
              />
            </div>
          )}

          {showUrl && (
            <div>
              <FieldLabel required>URL</FieldLabel>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://…"
                type="url"
              />
            </div>
          )}

          <div>
            <FieldLabel>Tags</FieldLabel>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="react, hooks, typescript"
            />
            <p className="mt-1 text-xs text-muted-foreground">Comma-separated</p>
          </div>

          <div>
            <FieldLabel>Collections</FieldLabel>
            <CollectionPicker selected={collectionIds} onChange={setCollectionIds} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !canSubmit}>
            {saving ? 'Creating…' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
