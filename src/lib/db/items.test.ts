import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getItemById } from './items';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    item: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

const { prisma } = await import('@/lib/prisma');
const mockFindFirst = vi.mocked(prisma.item.findFirst);

const baseItem = {
  id: 'item-1',
  title: 'useAuth hook',
  description: 'Custom auth hook',
  content: 'export function useAuth() {}',
  url: null,
  isFavorite: false,
  isPinned: false,
  language: 'typescript',
  createdAt: new Date('2026-01-15'),
  updatedAt: new Date('2026-01-15'),
  tags: [{ name: 'react' }, { name: 'hooks' }],
  itemType: { name: 'snippet', icon: 'Code', color: '#3b82f6' },
  collections: [{ collection: { id: 'col-1', name: 'React Patterns' } }],
};

describe('getItemById', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns null when item is not found', async () => {
    mockFindFirst.mockResolvedValue(null);
    expect(await getItemById('user-1', 'missing')).toBeNull();
  });

  it('scopes query to the given userId and id', async () => {
    mockFindFirst.mockResolvedValue(null);
    await getItemById('user-1', 'item-1');
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'item-1', userId: 'user-1' } })
    );
  });

  it('flattens tags from relation to string array', async () => {
    mockFindFirst.mockResolvedValue(baseItem);
    const result = await getItemById('user-1', 'item-1');
    expect(result?.tags).toEqual(['react', 'hooks']);
  });

  it('flattens collections from join table to id/name objects', async () => {
    mockFindFirst.mockResolvedValue(baseItem);
    const result = await getItemById('user-1', 'item-1');
    expect(result?.collections).toEqual([{ id: 'col-1', name: 'React Patterns' }]);
  });

  it('returns all scalar fields unchanged', async () => {
    mockFindFirst.mockResolvedValue(baseItem);
    const result = await getItemById('user-1', 'item-1');
    expect(result).toMatchObject({
      id: 'item-1',
      title: 'useAuth hook',
      language: 'typescript',
      isFavorite: false,
      isPinned: false,
    });
  });
});
