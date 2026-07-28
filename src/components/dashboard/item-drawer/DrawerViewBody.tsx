import { File, Download } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { CodeEditor } from '@/components/shared/CodeEditor';
import { MarkdownEditor } from '@/components/shared/MarkdownEditor';
import { formatBytes, formatDateLong } from '@/lib/format';
import { FieldLabel } from './FieldLabel';
import type { ItemDetailResponse } from './types';

interface DrawerViewBodyProps {
  item: ItemDetailResponse;
  typeName: string;
  useCodeEditor: boolean;
  useMarkdownEditor: boolean;
}

export function DrawerViewBody({ item, typeName, useCodeEditor, useMarkdownEditor }: DrawerViewBodyProps) {
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
