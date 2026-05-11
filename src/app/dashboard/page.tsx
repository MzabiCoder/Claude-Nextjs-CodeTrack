import { mockItems, mockItemTypes } from '@/lib/mock-data';
import { getDashboardCollections, getDashboardStats } from '@/lib/db/collections';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { CollectionCard } from '@/components/dashboard/CollectionCard';
import { ItemCard } from '@/components/dashboard/ItemCard';

const pinnedItems = mockItems.filter((i) => i.isPinned);

const recentItems = [...mockItems]
  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  .slice(0, 10);

export default async function DashboardPage() {
  const [collections, stats] = await Promise.all([
    getDashboardCollections(),
    getDashboardStats(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Your developer knowledge hub</p>
      </div>

      <StatsCards
        totalItems={stats.totalItems}
        totalCollections={stats.totalCollections}
        favoriteItems={stats.favoriteItems}
        favoriteCollections={stats.favoriteCollections}
      />

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Collections</h2>
          <a
            href="/collections"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      {pinnedItems.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Pinned</h2>
          <div className="space-y-3">
            {pinnedItems.map((item) => (
              <ItemCard key={item.id} item={item} itemTypes={mockItemTypes} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-4">Recent Items</h2>
        <div className="space-y-3">
          {recentItems.map((item) => (
            <ItemCard key={item.id} item={item} itemTypes={mockItemTypes} />
          ))}
        </div>
      </section>
    </div>
  );
}
