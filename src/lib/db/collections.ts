import { prisma } from '@/lib/prisma';
import { getDominantColor } from './utils';

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

export async function getDashboardCollections(): Promise<CollectionForCard[]> {
  const collections = await prisma.collection.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 6,
    select: {
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
    },
  });

  return collections.map((collection) => {
    const itemTypes = collection.items.map((ic) => ic.item.itemType);

    const typeCounts = itemTypes.reduce<
      Record<string, { count: number; type: (typeof itemTypes)[0] }>
    >((acc, type) => {
      if (!acc[type.id]) acc[type.id] = { count: 0, type };
      acc[type.id].count++;
      return acc;
    }, {});

    const sorted = Object.values(typeCounts).sort((a, b) => b.count - a.count);

    return {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      isFavorite: collection.isFavorite,
      updatedAt: collection.updatedAt,
      itemCount: collection.items.length,
      dominantColor: getDominantColor(collection.items),
      typeIcons: sorted.map((tc) => ({
        id: tc.type.id,
        name: tc.type.name,
        icon: tc.type.icon,
        color: tc.type.color,
      })),
    };
  });
}

export async function getDashboardStats() {
  const [totalItems, totalCollections, favoriteItems, favoriteCollections] = await Promise.all([
    prisma.item.count(),
    prisma.collection.count(),
    prisma.item.count({ where: { isFavorite: true } }),
    prisma.collection.count({ where: { isFavorite: true } }),
  ]);

  return { totalItems, totalCollections, favoriteItems, favoriteCollections };
}
