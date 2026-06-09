import { prisma } from '@/lib/prisma';

export type SearchItem = {
  id: string;
  title: string;
  typeName: string;
  typeIcon: string;
  typeColor: string;
  contentPreview: string | null;
};

export type SearchCollection = {
  id: string;
  name: string;
  itemCount: number;
};

export type SearchData = {
  items: SearchItem[];
  collections: SearchCollection[];
};

function contentPreview(item: {
  content: string | null;
  url: string | null;
  fileName: string | null;
}): string | null {
  if (item.content) return item.content.slice(0, 80);
  if (item.url) return item.url;
  if (item.fileName) return item.fileName;
  return null;
}

export async function getSearchData(userId: string): Promise<SearchData> {
  const [items, collections] = await Promise.all([
    prisma.item.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        content: true,
        url: true,
        fileName: true,
        itemType: { select: { name: true, icon: true, color: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 500,
    }),
    prisma.collection.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        _count: { select: { items: true } },
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  return {
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      typeName: item.itemType.name,
      typeIcon: item.itemType.icon,
      typeColor: item.itemType.color,
      contentPreview: contentPreview(item),
    })),
    collections: collections.map((c) => ({
      id: c.id,
      name: c.name,
      itemCount: c._count.items,
    })),
  };
}
