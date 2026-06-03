import { prisma } from '@/lib/prisma';

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

export type ItemDetail = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  language: string | null;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  itemType: { name: string; icon: string; color: string };
  collections: { id: string; name: string }[];
};

export async function getItemById(userId: string, id: string): Promise<ItemDetail | null> {
  const item = await prisma.item.findFirst({
    where: { id, userId },
    select: {
      id: true,
      title: true,
      description: true,
      content: true,
      url: true,
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

export async function getItemsByType(typeSlug: string): Promise<ItemForCard[]> {
  const typeName = SLUG_TO_TYPE[typeSlug];
  if (!typeName) return [];

  const items = await prisma.item.findMany({
    where: { itemType: { name: typeName } },
    orderBy: { createdAt: 'desc' },
    select: itemSelect,
  });
  return items.map(mapItem);
}
