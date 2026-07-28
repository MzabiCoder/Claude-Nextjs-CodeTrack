import { notFound } from 'next/navigation';
import { Star, Code, Sparkles, Terminal, StickyNote, File, Image, Link as LinkIcon } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import { auth } from '@/auth';
import { BackButton } from '@/components/shared/BackButton';
import { getCollectionById } from '@/lib/db/collections';
import { COLLECTIONS_PER_PAGE } from '@/lib/constants';
import { type ItemForCard } from '@/lib/db/items-queries';
import { CollectionItemCard } from '@/components/collections/CollectionItemCard';
import { CollectionActions } from '@/components/collections/CollectionActions';
import { Pagination } from '@/components/shared/Pagination';

const TYPE_ORDER = ['snippet', 'prompt', 'command', 'note', 'link', 'image', 'file'];

const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
};

function TypeSection({ typeName, icon, color, items, collectionId }: {
  typeName: string;
  icon: string;
  color: string;
  items: ItemForCard[];
  collectionId: string;
}) {
  const Icon = ICON_MAP[icon];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4" style={{ color }} />}
        <h2 className="text-sm font-semibold capitalize text-muted-foreground">{typeName}s</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => (
          <CollectionItemCard key={item.id} item={item} collectionId={collectionId} />
        ))}
      </div>
    </div>
  );
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ id }, { page: pageParam }] = await Promise.all([params, searchParams]);
  const session = await auth();
  if (!session?.user?.id) notFound();

  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const collection = await getCollectionById(session.user.id, id, page);
  if (!collection) notFound();

  const totalPages = Math.ceil(collection.itemCount / COLLECTIONS_PER_PAGE);

  const grouped = collection.items.reduce<Record<string, ItemForCard[]>>((acc, item) => {
    const name = item.itemType.name;
    if (!acc[name]) acc[name] = [];
    acc[name].push(item);
    return acc;
  }, {});

  const sections = TYPE_ORDER
    .filter((t) => grouped[t]?.length)
    .map((t) => ({
      typeName: t,
      icon: grouped[t][0].itemType.icon,
      color: grouped[t][0].itemType.color,
      items: grouped[t],
    }));

  const unknownTypes = Object.keys(grouped)
    .filter((t) => !TYPE_ORDER.includes(t))
    .map((t) => ({
      typeName: t,
      icon: grouped[t][0].itemType.icon,
      color: grouped[t][0].itemType.color,
      items: grouped[t],
    }));

  const allSections = [...sections, ...unknownTypes];

  return (
    <div className="space-y-6">
      <div>
        <BackButton />
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{collection.name}</h1>
              {collection.isFavorite && (
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              )}
            </div>
            {collection.description && (
              <p className="text-sm text-muted-foreground mt-1">{collection.description}</p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              {collection.itemCount} {collection.itemCount === 1 ? 'item' : 'items'}
            </p>
          </div>
          <CollectionActions collection={collection} />
        </div>
      </div>

      {collection.itemCount === 0 ? (
        <p className="text-muted-foreground">No items in this collection yet.</p>
      ) : (
        <>
          <div className="space-y-8">
            {allSections.map((section) => (
              <TypeSection key={section.typeName} collectionId={id} {...section} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} basePath={`/collections/${id}`} />
        </>
      )}
    </div>
  );
}
