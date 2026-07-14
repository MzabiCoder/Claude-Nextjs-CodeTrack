import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import { auth } from '@/auth';
import { getItemsByType } from '@/lib/db/items';
import { ITEMS_PER_PAGE } from '@/lib/constants';
import { PRO_ONLY_TYPES } from '@/lib/gates';
import { ItemCard } from '@/components/dashboard/ItemCard';
import { ImageCard } from '@/components/dashboard/ImageCard';
import { FileRow } from '@/components/dashboard/FileRow';
import { Pagination } from '@/components/shared/Pagination';

const VALID_TYPES = new Set([
  'snippets', 'prompts', 'commands', 'notes', 'files', 'images', 'links',
]);

const SLUG_TO_SINGULAR: Record<string, string> = {
  files: 'file',
  images: 'image',
};

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

  const singular = SLUG_TO_SINGULAR[type];
  if (singular && PRO_ONLY_TYPES.has(singular)) {
    const session = await auth();
    if (!session?.user?.id) redirect('/sign-in');
    if (!session.user.isPro) {
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
          </div>
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-lg">Pro feature</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Uploading and managing {type} is available on the Pro plan.
              </p>
            </div>
            <Link
              href="/billing"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>
      );
    }
  }

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
