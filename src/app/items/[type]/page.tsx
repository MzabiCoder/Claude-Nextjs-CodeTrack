import { notFound } from 'next/navigation';
import { getItemsByType } from '@/lib/db/items';
import { ItemCard } from '@/components/dashboard/ItemCard';

const VALID_TYPES = new Set([
  'snippets', 'prompts', 'commands', 'notes', 'files', 'images', 'links',
]);

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function ItemsTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;

  if (!VALID_TYPES.has(type)) notFound();

  const items = await getItemsByType(type);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{capitalize(type)}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground">No {type} yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
