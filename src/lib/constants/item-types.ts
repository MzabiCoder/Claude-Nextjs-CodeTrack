import { Code, Sparkles, Terminal, StickyNote, File, Image, Link } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const ITEM_TYPE_ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link,
};

export const CONTENT_TYPES = new Set(['snippet', 'prompt', 'command', 'note']);
export const LANGUAGE_TYPES = new Set(['snippet', 'command']);
export const CODE_EDITOR_TYPES = new Set(['snippet', 'command']);
export const MARKDOWN_EDITOR_TYPES = new Set(['note', 'prompt']);
export const FILE_TYPES = new Set(['file', 'image']);
