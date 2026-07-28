'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { generateAutoTags } from '@/actions/ai';

interface SuggestParams {
  title: string;
  content: string;
  typeName: string;
  currentTags: string;
}

export function useSuggestedTags() {
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function suggest({ title, content, typeName, currentTags }: SuggestParams) {
    setLoading(true);
    setSuggestedTags([]);
    try {
      const result = await generateAutoTags({ title, content: content || null, typeName });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      const existingTags = currentTags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
      setSuggestedTags(result.tags.filter((t) => !existingTags.includes(t)));
    } finally {
      setLoading(false);
    }
  }

  function accept(tag: string, currentTags: string, setTags: (v: string) => void) {
    const parts = currentTags.split(',').map((t) => t.trim()).filter(Boolean);
    if (!parts.map((t) => t.toLowerCase()).includes(tag.toLowerCase())) {
      parts.push(tag);
    }
    setTags(parts.join(', '));
    setSuggestedTags((prev) => prev.filter((t) => t !== tag));
  }

  function reject(tag: string) {
    setSuggestedTags((prev) => prev.filter((t) => t !== tag));
  }

  function reset() {
    setSuggestedTags([]);
  }

  return { suggestedTags, loading, suggest, accept, reject, reset };
}
