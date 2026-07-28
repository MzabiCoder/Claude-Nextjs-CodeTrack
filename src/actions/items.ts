'use server';

import { z } from 'zod';
import { getAuthUserId } from '@/lib/auth-helpers';
import { parseOrError } from '@/lib/validation';
import { toggleOwnedBooleanField } from '@/lib/db/utils';
import type { ActionResult } from '@/types/actions';
import { updateItemById, updateItemBasicById, deleteItemById, createItemInDb, getItemFileUrl, type ItemDetail } from '@/lib/db/items';
import { deleteObject, keyFromPublicUrl } from '@/lib/r2';
import { getUserIsPro, getUserItemCount, FREE_ITEM_LIMIT, PRO_ONLY_TYPES } from '@/lib/gates';

const createItemSchema = z.object({
  typeName: z.enum(['snippet', 'prompt', 'command', 'note', 'link', 'file', 'image']),
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().nullable().optional(),
  content: z.string().nullable().optional(),
  url: z.string().url('Must be a valid URL').nullable().optional().or(z.literal('')).transform((v) => v || null),
  language: z.string().trim().nullable().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
  collectionIds: z.array(z.string()).default([]),
  fileUrl: z.string().nullable().optional(),
  fileName: z.string().nullable().optional(),
  fileSize: z.number().nullable().optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;

export async function createItem(data: CreateItemInput): Promise<ActionResult> {
  const userId = await getAuthUserId();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  const parsed = parseOrError(createItemSchema, data);
  if (!parsed.success) {
    return parsed;
  }

  if (parsed.data.typeName === 'link' && !parsed.data.url) {
    return { success: false, error: 'URL is required for link items' };
  }
  if (['file', 'image'].includes(parsed.data.typeName) && !parsed.data.fileUrl) {
    return { success: false, error: 'File upload required' };
  }

  const isPro = await getUserIsPro(userId);
  if (PRO_ONLY_TYPES.has(parsed.data.typeName) && !isPro) {
    return { success: false, error: 'File and image uploads require a Pro subscription.' };
  }
  if (!isPro) {
    const count = await getUserItemCount(userId);
    if (count >= FREE_ITEM_LIMIT) {
      return { success: false, error: `Free plan is limited to ${FREE_ITEM_LIMIT} items. Upgrade to Pro for unlimited items.` };
    }
  }

  const created = await createItemInDb(userId, {
    typeName: parsed.data.typeName,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    content: parsed.data.content ?? null,
    url: parsed.data.url ?? null,
    language: parsed.data.language ?? null,
    tags: parsed.data.tags,
    collectionIds: parsed.data.collectionIds,
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
  collectionIds: z.array(z.string()).default([]),
});

export type UpdateItemInput = z.infer<typeof updateItemSchema>;

export async function updateItem(itemId: string, data: UpdateItemInput): Promise<ActionResult<ItemDetail>> {
  const userId = await getAuthUserId();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  const parsed = parseOrError(updateItemSchema, data);
  if (!parsed.success) {
    return parsed;
  }

  const updated = await updateItemById(userId, itemId, {
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    content: parsed.data.content ?? null,
    url: parsed.data.url ?? null,
    language: parsed.data.language ?? null,
    tags: parsed.data.tags,
    collectionIds: parsed.data.collectionIds,
  });

  if (!updated) {
    return { success: false, error: 'Item not found' };
  }

  return { success: true, data: updated };
}

export async function updateItemBasic(
  itemId: string,
  data: { title: string; description: string | null; tags: string[] }
): Promise<ActionResult> {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: 'Unauthorized' };
  if (!data.title.trim()) return { success: false, error: 'Title is required' };

  const updated = await updateItemBasicById(userId, itemId, {
    title: data.title.trim(),
    description: data.description,
    tags: data.tags,
  });
  return updated ? { success: true } : { success: false, error: 'Item not found' };
}

export async function toggleFavoriteItem(
  itemId: string
): Promise<{ success: true; isFavorite: boolean } | { success: false; error: string }> {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: 'Unauthorized' };

  const result = await toggleOwnedBooleanField('item', userId, itemId, 'isFavorite');
  if (!result.found) return { success: false, error: 'Item not found' };

  return { success: true, isFavorite: result.value };
}

export async function toggleItemPin(
  itemId: string
): Promise<{ success: true; isPinned: boolean } | { success: false; error: string }> {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: 'Unauthorized' };

  const result = await toggleOwnedBooleanField('item', userId, itemId, 'isPinned');
  if (!result.found) return { success: false, error: 'Item not found' };

  return { success: true, isPinned: result.value };
}

export async function deleteItem(itemId: string): Promise<ActionResult> {
  const userId = await getAuthUserId();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  // Fetch fileUrl before deletion for R2 cleanup
  const fileUrl = await getItemFileUrl(userId, itemId);

  const deleted = await deleteItemById(userId, itemId);
  if (!deleted) {
    return { success: false, error: 'Item not found' };
  }

  if (fileUrl) {
    const key = keyFromPublicUrl(fileUrl);
    await deleteObject(key);
  }

  return { success: true };
}
