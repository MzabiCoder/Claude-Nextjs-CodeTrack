'use server';

import { z } from 'zod';
import { auth } from '@/auth';
import { updateItemById, deleteItemById, createItemInDb, getItemFileUrl, type ItemDetail } from '@/lib/db/items';
import { deleteObject, keyFromPublicUrl } from '@/lib/r2';

const createItemSchema = z.object({
  typeName: z.enum(['snippet', 'prompt', 'command', 'note', 'link', 'file', 'image']),
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().nullable().optional(),
  content: z.string().nullable().optional(),
  url: z.string().url('Must be a valid URL').nullable().optional().or(z.literal('')).transform((v) => v || null),
  language: z.string().trim().nullable().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
  fileUrl: z.string().nullable().optional(),
  fileName: z.string().nullable().optional(),
  fileSize: z.number().nullable().optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
type CreateItemResult = { success: true } | { success: false; error: string };

export async function createItem(data: CreateItemInput): Promise<CreateItemResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const parsed = createItemSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  if (parsed.data.typeName === 'link' && !parsed.data.url) {
    return { success: false, error: 'URL is required for link items' };
  }
  if (['file', 'image'].includes(parsed.data.typeName) && !parsed.data.fileUrl) {
    return { success: false, error: 'File upload required' };
  }

  const created = await createItemInDb(session.user.id, {
    typeName: parsed.data.typeName,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    content: parsed.data.content ?? null,
    url: parsed.data.url ?? null,
    language: parsed.data.language ?? null,
    tags: parsed.data.tags,
    fileUrl: parsed.data.fileUrl ?? null,
    fileName: parsed.data.fileName ?? null,
    fileSize: parsed.data.fileSize ?? null,
  });

  if (!created) {
    return { success: false, error: 'Failed to create item' };
  }

  return { success: true };
}

const updateItemSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().nullable().optional(),
  content: z.string().nullable().optional(),
  url: z.string().url('Must be a valid URL').nullable().optional().or(z.literal('')).transform((v) => v || null),
  language: z.string().trim().nullable().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
});

export type UpdateItemInput = z.infer<typeof updateItemSchema>;

type UpdateItemResult =
  | { success: true; data: ItemDetail }
  | { success: false; error: string };

export async function updateItem(itemId: string, data: UpdateItemInput): Promise<UpdateItemResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const parsed = updateItemSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const updated = await updateItemById(session.user.id, itemId, {
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    content: parsed.data.content ?? null,
    url: parsed.data.url ?? null,
    language: parsed.data.language ?? null,
    tags: parsed.data.tags,
  });

  if (!updated) {
    return { success: false, error: 'Item not found' };
  }

  return { success: true, data: updated };
}

type DeleteItemResult = { success: true } | { success: false; error: string };

export async function deleteItem(itemId: string): Promise<DeleteItemResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  // Fetch fileUrl before deletion for R2 cleanup
  const fileUrl = await getItemFileUrl(session.user.id, itemId);

  const deleted = await deleteItemById(session.user.id, itemId);
  if (!deleted) {
    return { success: false, error: 'Item not found' };
  }

  if (fileUrl) {
    const key = keyFromPublicUrl(fileUrl);
    await deleteObject(key);
  }

  return { success: true };
}
