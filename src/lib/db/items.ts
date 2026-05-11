import { prisma } from '@/lib/prisma';

export type ItemForCard = {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  language: string | null;
  createdAt: Date;
  tags: string[];
  itemType: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
};

const itemSelect = {
  id: true,
  title: true,
  description: true,
  isFavorite: true,
  isPinned: true,
  language: true,
  createdAt: true,
  tags: { select: { name: true } },
  itemType: { select: { id: true, name: true, icon: true, color: true } },
} as const;

function mapItem(item: {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  language: string | null;
  createdAt: Date;
  tags: { name: string }[];
  itemType: { id: string; name: string; icon: string; color: string };
}): ItemForCard {
  return { ...item, tags: item.tags.map((t) => t.name) };
}

export async function getPinnedItems(): Promise<ItemForCard[]> {
  const items = await prisma.item.findMany({
    where: { isPinned: true },
    orderBy: { updatedAt: 'desc' },
    select: itemSelect,
  });
  return items.map(mapItem);
}

export async function getRecentItems(limit = 10): Promise<ItemForCard[]> {
  const items = await prisma.item.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: itemSelect,
  });
  return items.map(mapItem);
}
