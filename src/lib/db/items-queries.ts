import { prisma } from '@/lib/prisma';
import { ITEMS_PER_PAGE, DASHBOARD_RECENT_ITEMS_LIMIT } from '@/lib/constants';

const SLUG_TO_TYPE: Record<string, string> = {
  snippets: 'snippet',
  prompts: 'prompt',
  commands: 'command',
  notes: 'note',
  files: 'file',
  images: 'image',
  links: 'link',
};

export type ItemForCard = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
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

export const itemSelect = {
  id: true,
  title: true,
  description: true,
  content: true,
  url: true,
  fileUrl: true,
  fileName: true,
  fileSize: true,
  isFavorite: true,
  isPinned: true,
  language: true,
  createdAt: true,
  tags: { select: { name: true } },
  itemType: { select: { id: true, name: true, icon: true, color: true } },
} as const;

export function mapItem(item: {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  isFavorite: boolean;
  isPinned: boolean;
  language: string | null;
  createdAt: Date;
  tags: { name: string }[];
  itemType: { id: string; name: string; icon: string; color: string };
}): ItemForCard {
  return { ...item, tags: item.tags.map((t) => t.name) };
}

export type ItemDetail = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  isFavorite: boolean;
  isPinned: boolean;
  language: string | null;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  itemType: { name: string; icon: string; color: string };
  collections: { id: string; name: string }[];
};

export async function getPinnedItems(): Promise<ItemForCard[]> {
  const items = await prisma.item.findMany({
    where: { isPinned: true },
    orderBy: { updatedAt: 'desc' },
    take: 20,
    select: itemSelect,
  });
  return items.map(mapItem);
}

export async function getRecentItems(limit = DASHBOARD_RECENT_ITEMS_LIMIT): Promise<ItemForCard[]> {
  const items = await prisma.item.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: itemSelect,
  });
  return items.map(mapItem);
}

export async function getItemById(userId: string, id: string): Promise<ItemDetail | null> {
  const item = await prisma.item.findFirst({
    where: { id, userId },
    select: {
      id: true,
      title: true,
      description: true,
      content: true,
      url: true,
      fileUrl: true,
      fileName: true,
      fileSize: true,
      isFavorite: true,
      isPinned: true,
      language: true,
      createdAt: true,
      updatedAt: true,
      tags: { select: { name: true } },
      itemType: { select: { name: true, icon: true, color: true } },
      collections: { select: { collection: { select: { id: true, name: true } } } },
    },
  });
  if (!item) return null;
  return {
    ...item,
    tags: item.tags.map((t) => t.name),
    collections: item.collections.map((ic) => ic.collection),
  };
}

export async function getItemFileUrl(userId: string, id: string): Promise<string | null> {
  const item = await prisma.item.findFirst({
    where: { id, userId },
    select: { fileUrl: true },
  });
  return item?.fileUrl ?? null;
}

export async function getItemsByType(
  typeSlug: string,
  page = 1
): Promise<{ items: ItemForCard[]; totalCount: number }> {
  const typeName = SLUG_TO_TYPE[typeSlug];
  if (!typeName) return { items: [], totalCount: 0 };

  const where = { itemType: { name: typeName } };
  const [items, totalCount] = await Promise.all([
    prisma.item.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      select: itemSelect,
    }),
    prisma.item.count({ where }),
  ]);
  return { items: items.map(mapItem), totalCount };
}
