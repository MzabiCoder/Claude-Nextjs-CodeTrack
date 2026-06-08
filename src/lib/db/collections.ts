import { prisma } from '@/lib/prisma';
import { getDominantColor } from './utils';
import { itemSelect, mapItem, type ItemForCard } from './items-queries';

export type CollectionForCard = {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  updatedAt: Date;
  itemCount: number;
  dominantColor: string;
  typeIcons: Array<{ id: string; name: string; icon: string; color: string }>;
};

export type CollectionDetail = CollectionForCard & { items: ItemForCard[] };

// Shared select shape for collection card queries
const collectionCardSelect = {
  id: true,
  name: true,
  description: true,
  isFavorite: true,
  updatedAt: true,
  items: {
    select: {
      item: {
        select: {
          itemType: {
            select: { id: true, name: true, icon: true, color: true },
          },
        },
      },
    },
  },
} as const;

type CollectionCardRow = {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  updatedAt: Date;
  items: { item: { itemType: { id: string; name: string; icon: string; color: string } } }[];
};

function mapToCollectionForCard(row: CollectionCardRow): CollectionForCard {
  const itemTypes = row.items.map((ic) => ic.item.itemType);
  const typeCounts = itemTypes.reduce<
    Record<string, { count: number; type: (typeof itemTypes)[0] }>
  >((acc, type) => {
    if (!acc[type.id]) acc[type.id] = { count: 0, type };
    acc[type.id].count++;
    return acc;
  }, {});
  const sorted = Object.values(typeCounts).sort((a, b) => b.count - a.count);
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    isFavorite: row.isFavorite,
    updatedAt: row.updatedAt,
    itemCount: row.items.length,
    dominantColor: getDominantColor(row.items),
    typeIcons: sorted.map((tc) => ({
      id: tc.type.id,
      name: tc.type.name,
      icon: tc.type.icon,
      color: tc.type.color,
    })),
  };
}

export async function getDashboardCollections(userId: string): Promise<CollectionForCard[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    take: 6,
    select: collectionCardSelect,
  });
  return collections.map(mapToCollectionForCard);
}

export async function getAllCollections(userId: string): Promise<CollectionForCard[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: collectionCardSelect,
  });
  return collections.map(mapToCollectionForCard);
}

export async function getCollectionById(
  userId: string,
  id: string
): Promise<CollectionDetail | null> {
  const collection = await prisma.collection.findFirst({
    where: { id, userId },
    select: {
      id: true,
      name: true,
      description: true,
      isFavorite: true,
      updatedAt: true,
      items: {
        orderBy: { addedAt: 'desc' },
        select: {
          item: {
            select: {
              ...itemSelect,
              itemType: { select: { id: true, name: true, icon: true, color: true } },
            },
          },
        },
      },
    },
  });

  if (!collection) return null;

  const card = mapToCollectionForCard(collection);

  return {
    ...card,
    items: collection.items.map((ic) => mapItem(ic.item)),
  };
}

export async function getDashboardStats(userId: string) {
  const [totalItems, totalCollections, favoriteItems, favoriteCollections] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.item.count({ where: { userId, isFavorite: true } }),
    prisma.collection.count({ where: { userId, isFavorite: true } }),
  ]);

  return { totalItems, totalCollections, favoriteItems, favoriteCollections };
}
