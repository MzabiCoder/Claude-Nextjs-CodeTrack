'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function toggleFavoriteCollection(
  collectionId: string
): Promise<{ success: true; isFavorite: boolean } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId: session.user.id },
    select: { isFavorite: true },
  });
  if (!collection) return { success: false, error: 'Collection not found' };

  const updated = await prisma.collection.update({
    where: { id: collectionId },
    data: { isFavorite: !collection.isFavorite },
    select: { isFavorite: true },
  });
  return { success: true, isFavorite: updated.isFavorite };
}
