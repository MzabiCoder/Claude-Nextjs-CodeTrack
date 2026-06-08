import { prisma } from '@/lib/prisma';
import { ContentType } from '@/generated/prisma/enums';

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

const itemSelect = {
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

function mapItem(item: {
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

export async function getPinnedItems(): Promise<ItemForCard[]> {
  const items = await prisma.item.findMany({
    where: { isPinned: true },
    orderBy: { updatedAt: 'desc' },
    take: 20,
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

export type UpdateItemData = {
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  tags: string[];
};

export async function updateItemById(
  userId: string,
  id: string,
  data: UpdateItemData
): Promise<ItemDetail | null> {
  const existing = await prisma.item.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) return null;

  const updated = await prisma.item.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      tags: {
        set: [],
        connectOrCreate: data.tags.map((name) => ({
          where: { name },
          create: { name },
        })),
      },
    },
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

  return {
    ...updated,
    tags: updated.tags.map((t) => t.name),
    collections: updated.collections.map((ic) => ic.collection),
  };
}

const TYPE_TO_CONTENT_TYPE: Record<string, ContentType> = {
  snippet: ContentType.TEXT,
  prompt: ContentType.TEXT,
  command: ContentType.TEXT,
  note: ContentType.TEXT,
  link: ContentType.URL,
  file: ContentType.FILE,
  image: ContentType.FILE,
};

export type CreateItemData = {
  typeName: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  tags: string[];
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
};

export async function createItemInDb(userId: string, data: CreateItemData): Promise<ItemForCard | null> {
  const contentType = TYPE_TO_CONTENT_TYPE[data.typeName];
  if (!contentType) return null;

  const itemType = await prisma.itemType.findFirst({
    where: { name: data.typeName },
    select: { id: true },
  });
  if (!itemType) return null;

  const created = await prisma.item.create({
    data: {
      userId,
      itemTypeId: itemType.id,
      contentType,
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      fileUrl: data.fileUrl ?? null,
      fileName: data.fileName ?? null,
      fileSize: data.fileSize ?? null,
      tags: {
        connectOrCreate: data.tags.map((name) => ({
          where: { name },
          create: { name },
        })),
      },
    },
    select: itemSelect,
  });

  return mapItem(created);
}

export async function deleteItemById(userId: string, id: string): Promise<boolean> {
  const existing = await prisma.item.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) return false;
  await prisma.item.delete({ where: { id } });
  return true;
}

export async function getItemsByType(typeSlug: string): Promise<ItemForCard[]> {
  const typeName = SLUG_TO_TYPE[typeSlug];
  if (!typeName) return [];

  const items = await prisma.item.findMany({
    where: { itemType: { name: typeName } },
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: itemSelect,
  });
  return items.map(mapItem);
}
