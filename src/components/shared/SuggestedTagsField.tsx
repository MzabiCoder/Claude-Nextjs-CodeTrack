'use client';

import { Sparkles, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldLabel } from '@/components/shared/FieldLabel';

interface SuggestedTagsFieldProps {
  tags: string;
  onTagsChange: (v: string) => void;
  isPro: boolean;
  canSuggest: boolean;
  suggestedTags: string[];
  loadingTags: boolean;
  onSuggestTags: () => void;
  onAcceptTag: (tag: string) => void;
  onRejectTag: (tag: string) => void;
  labelComponent?: React.ComponentType<{ children: React.ReactNode }>;
}

export function SuggestedTagsField({
  tags,
  onTagsChange,
  isPro,
  canSuggest,
  suggestedTags,
  loadingTags,
  onSuggestTags,
  onAcceptTag,
  onRejectTag,
  labelComponent: Label = FieldLabel,
}: SuggestedTagsFieldProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-1.5">
        <Label>Tags</Label>
        {isPro && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={onSuggestTags}
            disabled={loadingTags || !canSuggest}
          >
            {loadingTags ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3 mr-1" />
            )}
            {loadingTags ? 'Suggesting…' : 'Suggest Tags'}
          </Button>
        )}
      </div>
      <Input
        value={tags}
        onChange={(e) => onTagsChange(e.target.value)}
        placeholder="react, hooks, typescript"
      />
      <p className="mt-1 text-xs text-muted-foreground">Comma-separated</p>
      {suggestedTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestedTags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20"
            >
              {tag}
              <button
                type="button"
                onClick={() => onAcceptTag(tag)}
                className="hover:text-green-400 transition-colors"
                aria-label={`Accept tag ${tag}`}
              >
                <Check className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => onRejectTag(tag)}
                className="hover:text-destructive transition-colors"
                aria-label={`Reject tag ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </>
  );
}
