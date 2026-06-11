'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { saveEditorPreferences } from '@/actions/settings';
import {
  type EditorPreferences,
  type EditorTheme,
  FONT_SIZE_OPTIONS,
  TAB_SIZE_OPTIONS,
  THEME_OPTIONS,
} from '@/types/editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface EditorPreferencesSectionProps {
  initial: EditorPreferences;
}

interface RowProps {
  label: string;
  description: string;
  children: React.ReactNode;
}

function PrefRow({ label, description, children }: RowProps) {
  return (
    <div className="flex items-center justify-between gap-6 py-3.5 border-b border-border/50 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium leading-none">{label}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function EditorPreferencesSection({ initial }: EditorPreferencesSectionProps) {
  const [prefs, setPrefs] = useState<EditorPreferences>(initial);
  const [, startTransition] = useTransition();

  function handleChange(patch: Partial<EditorPreferences>) {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    startTransition(async () => {
      const result = await saveEditorPreferences(next);
      if (result.success) {
        toast.success('Editor preferences saved');
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-base font-semibold">Editor Preferences</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Customize the code editor appearance</p>
      </div>

      <div className="px-6 divide-y divide-border/50">
        <PrefRow label="Font Size" description="Controls the editor font size in pixels">
          <Select
            value={String(prefs.fontSize)}
            onValueChange={(v) => handleChange({ fontSize: Number(v) })}
          >
            <SelectTrigger className="w-28 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </PrefRow>

        <PrefRow label="Tab Size" description="Number of spaces inserted when pressing Tab">
          <Select
            value={String(prefs.tabSize)}
            onValueChange={(v) => handleChange({ tabSize: Number(v) })}
          >
            <SelectTrigger className="w-28 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TAB_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} spaces
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </PrefRow>

        <PrefRow label="Theme" description="Color theme applied to the code editor">
          <Select
            value={prefs.theme}
            onValueChange={(v) => handleChange({ theme: v as EditorTheme })}
          >
            <SelectTrigger className="w-36 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THEME_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </PrefRow>

        <PrefRow label="Word Wrap" description="Wrap long lines to fit the editor width">
          <Switch
            checked={prefs.wordWrap}
            onCheckedChange={(checked) => handleChange({ wordWrap: checked })}
          />
        </PrefRow>

        <PrefRow label="Minimap" description="Show a code overview panel on the right side">
          <Switch
            checked={prefs.minimap}
            onCheckedChange={(checked) => handleChange({ minimap: checked })}
          />
        </PrefRow>
      </div>
    </div>
  );
}
