'use server';

import { getAuthUserId } from '@/lib/auth-helpers';
import { toggleOwnedBooleanField } from '@/lib/db/utils';

export async function toggleFavoriteCollection(
  collectionId: string
): Promise<{ success: true; isFavorite: boolean } | { success: false; error: string }> {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: 'Unauthorized' };

  const result = await toggleOwnedBooleanField('collection', userId, collectionId, 'isFavorite');
  if (!result.found) return { success: false, error: 'Collection not found' };

  return { success: true, isFavorite: result.value };
}
