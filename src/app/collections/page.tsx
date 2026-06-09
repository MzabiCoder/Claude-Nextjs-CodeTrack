import { auth } from '@/auth';
import { getAllCollections } from '@/lib/db/collections';
import { COLLECTIONS_PER_PAGE } from '@/lib/constants';
import { CollectionCard } from '@/components/dashboard/CollectionCard';
import { Pagination } from '@/components/shared/Pagination';

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id ?? '';
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);

  const { collections, totalCount } = await getAllCollections(userId, page);
  const totalPages = Math.ceil(totalCount / COLLECTIONS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Collections</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {totalCount} {totalCount === 1 ? 'collection' : 'collections'}
        </p>
      </div>

      {totalCount === 0 ? (
        <p className="text-muted-foreground">No collections yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              href={`/collections/${collection.id}`}
            />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} basePath="/collections" />
    </div>
  );
}
