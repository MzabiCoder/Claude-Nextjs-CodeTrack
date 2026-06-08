import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getItemById, deleteItemById, createItemInDb } from './items';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    item: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
      create: vi.fn(),
    },
    itemType: {
      findFirst: vi.fn(),
    },
  },
}));

const { prisma } = await import('@/lib/prisma');
const mockFindFirst = vi.mocked(prisma.item.findFirst);
const mockDelete = vi.mocked(prisma.item.delete);
const mockCreate = vi.mocked(prisma.item.create);
const mockItemTypeFindFirst = vi.mocked(prisma.itemType.findFirst);

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
    mockFindFirst.mockResolvedValue(baseItem as never);
    const result = await getItemById('user-1', 'item-1');
    expect(result?.tags).toEqual(['react', 'hooks']);
  });

  it('flattens collections from join table to id/name objects', async () => {
    mockFindFirst.mockResolvedValue(baseItem as never);
    const result = await getItemById('user-1', 'item-1');
    expect(result?.collections).toEqual([{ id: 'col-1', name: 'React Patterns' }]);
  });

  it('returns all scalar fields unchanged', async () => {
    mockFindFirst.mockResolvedValue(baseItem as never);
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

describe('deleteItemById', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns false when item is not found or belongs to another user', async () => {
    mockFindFirst.mockResolvedValue(null);
    expect(await deleteItemById('user-1', 'missing')).toBe(false);
  });

  it('does not call delete when ownership check fails', async () => {
    mockFindFirst.mockResolvedValue(null);
    await deleteItemById('user-1', 'missing');
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('scopes ownership check to userId and id', async () => {
    mockFindFirst.mockResolvedValue(null);
    await deleteItemById('user-42', 'item-99');
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'item-99', userId: 'user-42' } })
    );
  });

  it('calls prisma.item.delete with the correct id', async () => {
    mockFindFirst.mockResolvedValue({ id: 'item-1' } as never);
    mockDelete.mockResolvedValue({} as never);
    await deleteItemById('user-1', 'item-1');
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'item-1' } });
  });

  it('returns true on successful deletion', async () => {
    mockFindFirst.mockResolvedValue({ id: 'item-1' } as never);
    mockDelete.mockResolvedValue({} as never);
    expect(await deleteItemById('user-1', 'item-1')).toBe(true);
  });
});

const createdItem = {
  id: 'item-new',
  title: 'My Snippet',
  description: null,
  isFavorite: false,
  isPinned: false,
  language: 'typescript',
  createdAt: new Date('2026-01-01'),
  tags: [{ name: 'react' }],
  itemType: { id: 'type-1', name: 'snippet', icon: 'Code', color: '#3b82f6' },
};

describe('createItemInDb', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns null for an unknown type name', async () => {
    expect(await createItemInDb('user-1', {
      typeName: 'unknown',
      title: 'Test',
      description: null,
      content: null,
      url: null,
      language: null,
      tags: [],
    })).toBeNull();
  });

  it('returns null when itemType is not found in the database', async () => {
    mockItemTypeFindFirst.mockResolvedValue(null);
    expect(await createItemInDb('user-1', {
      typeName: 'snippet',
      title: 'Test',
      description: null,
      content: null,
      url: null,
      language: null,
      tags: [],
    })).toBeNull();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('creates item with TEXT contentType for snippet', async () => {
    mockItemTypeFindFirst.mockResolvedValue({ id: 'type-1' } as never);
    mockCreate.mockResolvedValue(createdItem as never);
    await createItemInDb('user-1', {
      typeName: 'snippet',
      title: 'Test',
      description: null,
      content: 'code here',
      url: null,
      language: 'typescript',
      tags: [],
    });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ contentType: 'TEXT' }) })
    );
  });

  it('creates item with URL contentType for link', async () => {
    mockItemTypeFindFirst.mockResolvedValue({ id: 'type-2' } as never);
    mockCreate.mockResolvedValue({ ...createdItem, itemType: { ...createdItem.itemType, name: 'link' } } as never);
    await createItemInDb('user-1', {
      typeName: 'link',
      title: 'My Link',
      description: null,
      content: null,
      url: 'https://example.com',
      language: null,
      tags: [],
    });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ contentType: 'URL' }) })
    );
  });

  it('flattens tags from relation to string array', async () => {
    mockItemTypeFindFirst.mockResolvedValue({ id: 'type-1' } as never);
    mockCreate.mockResolvedValue(createdItem as never);
    const result = await createItemInDb('user-1', {
      typeName: 'snippet',
      title: 'Test',
      description: null,
      content: null,
      url: null,
      language: null,
      tags: ['react'],
    });
    expect(result?.tags).toEqual(['react']);
  });
});
