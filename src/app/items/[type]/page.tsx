import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getItemsByType } from '@/lib/db/items';
import { ITEMS_PER_PAGE } from '@/lib/constants';
import { ItemCard } from '@/components/dashboard/ItemCard';
import { ImageCard } from '@/components/dashboard/ImageCard';
import { FileRow } from '@/components/dashboard/FileRow';
import { Pagination } from '@/components/shared/Pagination';

const VALID_TYPES = new Set([
  'snippets', 'prompts', 'commands', 'notes', 'files', 'images', 'links',
]);

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function ItemsTypePage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ type }, { page: pageParam }] = await Promise.all([params, searchParams]);

  if (!VALID_TYPES.has(type)) notFound();

  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const { items, totalCount } = await getItemsByType(type, page);
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const isImageGallery = type === 'images';
  const isFileList = type === 'files';

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold">{capitalize(type)}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {totalCount} {totalCount === 1 ? 'item' : 'items'}
        </p>
      </div>

      {totalCount === 0 ? (
        <p className="text-muted-foreground">No {type} yet.</p>
      ) : isFileList ? (
        <div className="rounded-lg border border-border overflow-hidden divide-y divide-border">
          {items.map((item) => (
            <FileRow key={item.id} item={item} />
          ))}
        </div>
      ) : isImageGallery ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => (
            <ImageCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} basePath={`/items/${type}`} />
    </div>
  );
}
