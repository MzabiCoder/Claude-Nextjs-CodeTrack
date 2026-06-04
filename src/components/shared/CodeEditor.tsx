'use client';

import { useRef, useState, useCallback } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import { Copy, Check } from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string | null;
  readOnly?: boolean;
}

export function CodeEditor({ value, onChange, language, readOnly = false }: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [height, setHeight] = useState(120);
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
    updateHeight(editor);
    editor.onDidContentSizeChange(() => updateHeight(editor));
  }, []);

  function updateHeight(editor: Monaco.editor.IStandaloneCodeEditor) {
    const contentHeight = Math.max(120, Math.min(400, editor.getContentHeight()));
    setHeight(contentHeight);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const monacoLang = language?.toLowerCase() || 'plaintext';

  return (
    <div className="rounded-md overflow-hidden border border-border">
      <div className="flex items-center justify-between px-3 py-2 bg-[#1e1e1e] border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          {language && (
            <span className="ml-2 text-xs text-zinc-400 font-mono">{language}</span>
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
      <Editor
        height={height}
        value={value}
        onChange={(v) => onChange?.(v ?? '')}
        language={monacoLang}
        theme="vs-dark"
        options={{
          readOnly,
          fontSize: 12,
          fontFamily: '"ui-monospace", "SFMono-Regular", "Menlo", monospace',
          lineNumbers: 'on',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
          padding: { top: 8, bottom: 8 },
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
          },
          overviewRulerLanes: 0,
          renderLineHighlight: readOnly ? 'none' : 'line',
          hideCursorInOverviewRuler: true,
          contextmenu: !readOnly,
        }}
        onMount={handleMount}
      />
    </div>
  );
}
