import { prisma } from '@/lib/prisma';

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

export async function getSidebarData(): Promise<SidebarData> {
  const [itemTypes, collections] = await Promise.all([
    prisma.itemType.findMany({
      where: { isSystem: true },
      include: { _count: { select: { items: true } } },
    }),
    prisma.collection.findMany({
      orderBy: [{ isFavorite: 'desc' }, { updatedAt: 'desc' }],
      include: {
        items: {
          include: { item: { include: { itemType: true } } },
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
    collections: collections.map((collection) => {
      const typeCounts = collection.items.reduce<Record<string, { count: number; color: string }>>(
        (acc, ic) => {
          const { id, color } = ic.item.itemType;
          if (!acc[id]) acc[id] = { count: 0, color };
          acc[id].count++;
          return acc;
        },
        {}
      );

      const dominant = Object.values(typeCounts).sort((a, b) => b.count - a.count)[0];

      return {
        id: collection.id,
        name: collection.name,
        isFavorite: collection.isFavorite,
        dominantColor: dominant?.color ?? '#6b7280',
        itemCount: collection.items.length,
      };
    }),
  };
}
