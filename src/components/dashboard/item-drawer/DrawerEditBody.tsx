import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LANGUAGES } from '@/lib/constants/languages';
import { CodeEditor } from '@/components/shared/CodeEditor';
import { MarkdownEditor } from '@/components/shared/MarkdownEditor';
import { CollectionPicker } from '@/components/shared/CollectionPicker';
import { SuggestedTagsField } from '@/components/shared/SuggestedTagsField';
import { formatDateLong } from '@/lib/format';
import { FieldLabel } from './FieldLabel';
import type { DrawerFormData } from './types';

interface DrawerEditBodyProps {
  formData: DrawerFormData;
  showContent: boolean;
  showLanguage: boolean;
  showUrl: boolean;
  useCodeEditor: boolean;
  useMarkdownEditor: boolean;
  selectedCollectionIds: string[];
  onCollectionChange: (ids: string[]) => void;
  createdAt: string;
  updatedAt: string;
  updateField: (field: keyof DrawerFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onContentChange: (v: string) => void;
  onLanguageChange: (v: string) => void;
  onTagsChange: (v: string) => void;
  isPro: boolean;
  suggestedTags: string[];
  loadingTags: boolean;
  onSuggestTags: () => void;
  onAcceptTag: (tag: string) => void;
  onRejectTag: (tag: string) => void;
}

export function DrawerEditBody({
  formData, showContent, showLanguage, showUrl,
  useCodeEditor, useMarkdownEditor, selectedCollectionIds, onCollectionChange,
  createdAt, updatedAt, updateField, onContentChange, onLanguageChange, onTagsChange,
  isPro, suggestedTags, loadingTags, onSuggestTags, onAcceptTag, onRejectTag,
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
        <SuggestedTagsField
          tags={formData.tags}
          onTagsChange={onTagsChange}
          isPro={isPro}
          canSuggest={formData.title.trim() !== ''}
          suggestedTags={suggestedTags}
          loadingTags={loadingTags}
          onSuggestTags={onSuggestTags}
          onAcceptTag={onAcceptTag}
          onRejectTag={onRejectTag}
          labelComponent={FieldLabel}
        />
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
