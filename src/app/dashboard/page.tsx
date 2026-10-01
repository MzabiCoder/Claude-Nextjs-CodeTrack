import { auth } from '@/auth';
import { getDashboardCollections, getDashboardStats } from '@/lib/db/collections';
import { getPinnedItems, getRecentItems } from '@/lib/db/items';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { CollectionCard } from '@/components/dashboard/CollectionCard';
import { ItemCard } from '@/components/dashboard/ItemCard';

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id ?? '';

  const [collections, stats, pinnedItems, recentItems] = await Promise.all([
    getDashboardCollections(userId),
    getDashboardStats(userId),
    getPinnedItems(userId),
    getRecentItems(userId),
  ]);

  return (
    <div className="space-y-8 sm:space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="mt-1.5 text-sm text-muted-foreground sm:text-[15px]">
          Your developer knowledge hub
        </p>
      </div>

      <StatsCards
        totalItems={stats.totalItems}
        totalCollections={stats.totalCollections}
        favoriteItems={stats.favoriteItems}
        favoriteCollections={stats.favoriteCollections}
      />

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight sm:text-xl">Collections</h2>
          <a
            href="/collections"
            className="rounded-lg px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            View all
          </a>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              href={`/collections/${collection.id}`}
            />
          ))}
        </div>
      </section>

      {pinnedItems.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold tracking-tight sm:text-xl">Pinned</h2>
          <div className="space-y-3">
            {pinnedItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight sm:text-xl">Recent Items</h2>
        <div className="space-y-3">
          {recentItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
