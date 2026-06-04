'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

export function MarkdownEditor({ value, onChange, readOnly = false, placeholder }: MarkdownEditorProps) {
  const [tab, setTab] = useState<'write' | 'preview'>(readOnly ? 'preview' : 'write');
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-md overflow-hidden border border-border">
      <div className="flex items-center justify-between px-3 py-2 bg-[#1e1e1e] border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          {!readOnly && (
            <div className="ml-2 flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setTab('write')}
                className={`px-2 py-0.5 text-xs rounded transition-colors ${
                  tab === 'write'
                    ? 'bg-white/10 text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setTab('preview')}
                className={`px-2 py-0.5 text-xs rounded transition-colors ${
                  tab === 'preview'
                    ? 'bg-white/10 text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Preview
              </button>
            </div>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          type="button"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {tab === 'write' && !readOnly ? (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder ?? 'Write markdown…'}
          className="w-full bg-[#1e1e1e] text-zinc-100 px-3 py-3 text-sm font-mono resize-none focus:outline-none placeholder:text-zinc-600 min-h-[120px] max-h-[400px] overflow-y-auto"
          style={{ minHeight: 120, maxHeight: 400 }}
        />
      ) : (
        <div
          className="markdown-preview bg-[#1e1e1e] px-4 py-3 overflow-y-auto"
          style={{ minHeight: 120, maxHeight: 400 }}
        >
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-zinc-600 text-sm font-mono">{placeholder ?? 'Nothing to preview'}</p>
          )}
        </div>
      )}
    </div>
  );
}
