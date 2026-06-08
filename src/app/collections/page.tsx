import { auth } from '@/auth';
import { getAllCollections } from '@/lib/db/collections';
import { CollectionCard } from '@/components/dashboard/CollectionCard';

export default async function CollectionsPage() {
  const session = await auth();
  const userId = session?.user?.id ?? '';
  const collections = await getAllCollections(userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Collections</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {collections.length} {collections.length === 1 ? 'collection' : 'collections'}
        </p>
      </div>

      {collections.length === 0 ? (
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
    </div>
  );
}
