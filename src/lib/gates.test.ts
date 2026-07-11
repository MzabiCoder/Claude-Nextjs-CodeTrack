import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  FREE_ITEM_LIMIT,
  FREE_COLLECTION_LIMIT,
  PRO_ONLY_TYPES,
  getUserItemCount,
  getUserCollectionCount,
  getUserIsPro,
} from '@/lib/gates';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    item: { count: vi.fn() },
    collection: { count: vi.fn() },
    user: { findUnique: vi.fn() },
  },
}));

import { prisma } from '@/lib/prisma';

const mockPrisma = prisma as {
  item: { count: ReturnType<typeof vi.fn> };
  collection: { count: ReturnType<typeof vi.fn> };
  user: { findUnique: ReturnType<typeof vi.fn> };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('constants', () => {
  it('FREE_ITEM_LIMIT is 50', () => {
    expect(FREE_ITEM_LIMIT).toBe(50);
  });

  it('FREE_COLLECTION_LIMIT is 3', () => {
    expect(FREE_COLLECTION_LIMIT).toBe(3);
  });

  it('PRO_ONLY_TYPES contains file and image', () => {
    expect(PRO_ONLY_TYPES.has('file')).toBe(true);
    expect(PRO_ONLY_TYPES.has('image')).toBe(true);
  });

  it('PRO_ONLY_TYPES does not contain snippet', () => {
    expect(PRO_ONLY_TYPES.has('snippet')).toBe(false);
  });
});

describe('getUserItemCount', () => {
  it('returns count from prisma.item.count', async () => {
    mockPrisma.item.count.mockResolvedValue(17);
    const result = await getUserItemCount('user-1');
    expect(result).toBe(17);
    expect(mockPrisma.item.count).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
  });
});

describe('getUserCollectionCount', () => {
  it('returns count from prisma.collection.count', async () => {
    mockPrisma.collection.count.mockResolvedValue(2);
    const result = await getUserCollectionCount('user-1');
    expect(result).toBe(2);
    expect(mockPrisma.collection.count).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
  });
});

describe('getUserIsPro', () => {
  it('returns true when user isPro is true', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ isPro: true });
    const result = await getUserIsPro('user-1');
    expect(result).toBe(true);
  });

  it('returns false when user isPro is false', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ isPro: false });
    const result = await getUserIsPro('user-1');
    expect(result).toBe(false);
  });

  it('returns false when user is not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const result = await getUserIsPro('user-1');
    expect(result).toBe(false);
  });
});
