import { prisma } from '@/lib/prisma';
import { getDominantColor } from './utils';

export type SidebarItemType = {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
};

export type SidebarCollection = {
  id: string;
  name: string;
  isFavorite: boolean;
  dominantColor: string;
  itemCount: number;
};

export type SidebarData = {
  itemTypes: SidebarItemType[];
  collections: SidebarCollection[];
};

export async function getSidebarData(userId: string): Promise<SidebarData> {
  const [itemTypes, collections] = await Promise.all([
    prisma.itemType.findMany({
      where: { isSystem: true },
      include: {
        _count: { select: { items: { where: { userId } } } },
      },
    }),
    prisma.collection.findMany({
      where: { userId },
      orderBy: [{ isFavorite: 'desc' }, { updatedAt: 'desc' }],
      take: 20,
      select: {
        id: true,
        name: true,
        isFavorite: true,
        items: {
          select: {
            item: {
              select: {
                itemType: {
                  select: { id: true, color: true },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    itemTypes: itemTypes.map((type) => ({
      id: type.id,
      name: type.name,
      icon: type.icon,
      color: type.color,
      count: type._count.items,
    })),
    collections: collections.map((collection) => ({
      id: collection.id,
      name: collection.name,
      isFavorite: collection.isFavorite,
      dominantColor: getDominantColor(collection.items),
      itemCount: collection.items.length,
    })),
  };
}
