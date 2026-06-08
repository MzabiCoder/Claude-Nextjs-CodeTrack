import { prisma } from '@/lib/prisma';
import { ContentType } from '@/generated/prisma/enums';
import { type ItemForCard, type ItemDetail, itemSelect, mapItem } from './items-queries';

const TYPE_TO_CONTENT_TYPE: Record<string, ContentType> = {
  snippet: ContentType.TEXT,
  prompt: ContentType.TEXT,
  command: ContentType.TEXT,
  note: ContentType.TEXT,
  link: ContentType.URL,
  file: ContentType.FILE,
  image: ContentType.FILE,
};

export type UpdateItemData = {
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  tags: string[];
  collectionIds: string[];
};

export async function updateItemById(
  userId: string,
  id: string,
  data: UpdateItemData
): Promise<ItemDetail | null> {
  const existing = await prisma.item.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) return null;

  const updated = await prisma.$transaction(async (tx) => {
    await tx.itemCollection.deleteMany({ where: { itemId: id } });
    if (data.collectionIds.length > 0) {
      await tx.itemCollection.createMany({
        data: data.collectionIds.map((collectionId) => ({ itemId: id, collectionId })),
      });
    }
    return tx.item.update({
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
  });

  return {
    ...updated,
    tags: updated.tags.map((t) => t.name),
    collections: updated.collections.map((ic) => ic.collection),
  };
}

export type CreateItemData = {
  typeName: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  tags: string[];
  collectionIds: string[];
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
      collections: {
        create: data.collectionIds.map((collectionId) => ({ collectionId })),
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
