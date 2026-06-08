'use client';

import { useRef, useState } from 'react';
import { Upload, X, File as FileIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatBytes } from '@/lib/format';

const IMAGE_ACCEPT = '.png,.jpg,.jpeg,.gif,.webp,.svg';
const FILE_ACCEPT = '.pdf,.txt,.md,.json,.yaml,.yml,.xml,.csv,.toml,.ini';

const IMAGE_TYPES = new Set([
  'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml',
]);
const FILE_TYPES = new Set([
  'application/pdf', 'text/plain', 'text/markdown', 'application/json',
  'application/x-yaml', 'text/yaml', 'application/xml', 'text/xml',
  'text/csv', 'application/toml',
]);

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_FILE_SIZE = 10 * 1024 * 1024;


export type UploadResult = {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  key: string;
};

interface FileUploadProps {
  itemType: 'file' | 'image';
  onUploadComplete: (result: UploadResult) => void;
  onClear: () => void;
}

type UploadState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'uploading'; progress: number; fileName: string }
  | { status: 'done'; result: UploadResult; previewUrl?: string };

export function FileUpload({ itemType, onUploadComplete, onClear }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [state, setState] = useState<UploadState>({ status: 'idle' });

  const isImage = itemType === 'image';
  const accept = isImage ? IMAGE_ACCEPT : FILE_ACCEPT;
  const allowedTypes = isImage ? IMAGE_TYPES : FILE_TYPES;
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;
  const maxSizeLabel = isImage ? '5 MB' : '10 MB';

  async function handleFile(file: File) {
    if (!allowedTypes.has(file.type)) {
      setState({ status: 'error', message: `File type not allowed: ${file.type || 'unknown'}` });
      return;
    }
    if (file.size > maxSize) {
      setState({ status: 'error', message: `File too large. Max ${maxSizeLabel}.` });
      return;
    }

    setState({ status: 'uploading', progress: 0, fileName: file.name });

    try {
      const result = await new Promise<UploadResult>((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('itemType', itemType);

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setState({
              status: 'uploading',
              progress: Math.round((e.loaded / e.total) * 100),
              fileName: file.name,
            });
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText) as UploadResult);
            } catch {
              reject(new Error('Invalid server response'));
            }
          } else {
            try {
              const data = JSON.parse(xhr.responseText) as { error?: string };
              reject(new Error(data.error ?? 'Upload failed'));
            } catch {
              reject(new Error('Upload failed'));
            }
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error')));
        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      });

      const previewUrl = isImage ? URL.createObjectURL(file) : undefined;
      setState({ status: 'done', result, previewUrl });
      onUploadComplete(result);
    } catch (err) {
      setState({ status: 'error', message: (err as Error).message });
    }
  }

  function handleClear() {
    if (state.status === 'done' && state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl);
    }
    setState({ status: 'idle' });
    if (inputRef.current) inputRef.current.value = '';
    onClear();
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  if (state.status === 'done') {
    return (
      <div className="rounded-md border border-border bg-muted/20 p-3">
        <div className="flex items-start gap-3">
          {state.previewUrl ? (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={state.previewUrl}
                alt={state.result.fileName}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
              <FileIcon className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
              <p className="text-sm font-medium truncate">{state.result.fileName}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatBytes(state.result.fileSize)} · Uploaded
            </p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  if (state.status === 'uploading') {
    return (
      <div className="rounded-md border border-border bg-muted/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
          <p className="text-sm truncate flex-1">{state.fileName}</p>
          <span className="text-xs text-muted-foreground tabular-nums">{state.progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-[width] duration-100"
            style={{ width: `${state.progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      {state.status === 'error' && (
        <div className="flex items-center gap-1.5 mb-2 text-sm text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {state.message}
        </div>
      )}
      <div
        role="button"
        tabIndex={0}
        className={`flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 text-center cursor-pointer transition-colors outline-none ${
          dragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-muted-foreground/50 focus-visible:border-primary'
        }`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <Upload className="h-7 w-7 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">
            Drop {isImage ? 'image' : 'file'} here or{' '}
            <span className="text-primary">browse</span>
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isImage
              ? 'PNG, JPG, GIF, WebP, SVG — max 5 MB'
              : 'PDF, TXT, MD, JSON, YAML, XML, CSV, TOML — max 10 MB'}
          </p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
