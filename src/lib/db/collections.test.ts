import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllCollections, getCollectionById } from './collections';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    collection: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
    },
  },
}));

const { prisma } = await import('@/lib/prisma');
const mockFindMany = vi.mocked(prisma.collection.findMany);
const mockFindFirst = vi.mocked(prisma.collection.findFirst);
const mockCount = vi.mocked(prisma.collection.count);

const snippetType = { id: 'type-snippet', name: 'snippet', icon: 'Code', color: '#3b82f6' };
const promptType = { id: 'type-prompt', name: 'prompt', icon: 'Sparkles', color: '#8b5cf6' };

function makeCollectionRow(overrides: {
  id?: string;
  name?: string;
  description?: string | null;
  isFavorite?: boolean;
  updatedAt?: Date;
  items?: { item: { itemType: { id: string; name: string; icon: string; color: string } } }[];
}) {
  return {
    id: overrides.id ?? 'col-1',
    name: overrides.name ?? 'React Patterns',
    description: overrides.description ?? null,
    isFavorite: overrides.isFavorite ?? false,
    updatedAt: overrides.updatedAt ?? new Date('2026-01-15'),
    items: overrides.items ?? [],
  };
}

function makeItem(typeOverride = snippetType) {
  return {
    id: `item-${Math.random()}`,
    title: 'Test Item',
    description: null,
    content: 'some content',
    url: null,
    fileUrl: null,
    fileName: null,
    fileSize: null,
    isFavorite: false,
    isPinned: false,
    language: null,
    createdAt: new Date('2026-01-15'),
    tags: [],
    itemType: typeOverride,
  };
}

// ─── getAllCollections ────────────────────────────────────────────────────────

describe('getAllCollections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCount.mockResolvedValue(0);
  });

  it('returns empty collections array when user has no collections', async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);
    const result = await getAllCollections('user-1');
    expect(result.collections).toEqual([]);
    expect(result.totalCount).toBe(0);
  });

  it('scopes query to the given userId', async () => {
    mockFindMany.mockResolvedValue([]);
    await getAllCollections('user-42');
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-42' } })
    );
  });

  it('maps itemCount correctly', async () => {
    const row = makeCollectionRow({
      items: [
        { item: { itemType: snippetType } },
        { item: { itemType: snippetType } },
        { item: { itemType: promptType } },
      ],
    });
    mockFindMany.mockResolvedValue([row] as never);
    mockCount.mockResolvedValue(1);
    const { collections } = await getAllCollections('user-1');
    expect(collections[0].itemCount).toBe(3);
  });

  it('sets dominantColor to the most-used type color', async () => {
    const row = makeCollectionRow({
      items: [
        { item: { itemType: promptType } },
        { item: { itemType: snippetType } },
        { item: { itemType: snippetType } },
      ],
    });
    mockFindMany.mockResolvedValue([row] as never);
    mockCount.mockResolvedValue(1);
    const { collections } = await getAllCollections('user-1');
    expect(collections[0].dominantColor).toBe(snippetType.color);
  });

  it('falls back dominantColor to gray when collection has no items', async () => {
    mockFindMany.mockResolvedValue([makeCollectionRow({ items: [] })] as never);
    mockCount.mockResolvedValue(1);
    const { collections } = await getAllCollections('user-1');
    expect(collections[0].dominantColor).toBe('#6b7280');
  });

  it('returns typeIcons sorted by count descending', async () => {
    const row = makeCollectionRow({
      items: [
        { item: { itemType: promptType } },
        { item: { itemType: snippetType } },
        { item: { itemType: snippetType } },
      ],
    });
    mockFindMany.mockResolvedValue([row] as never);
    mockCount.mockResolvedValue(1);
    const { collections } = await getAllCollections('user-1');
    expect(collections[0].typeIcons[0].id).toBe(snippetType.id);
    expect(collections[0].typeIcons[1].id).toBe(promptType.id);
  });

  it('maps name, description, isFavorite, updatedAt through correctly', async () => {
    const updatedAt = new Date('2026-03-10');
    const row = makeCollectionRow({ name: 'AI Workflows', description: 'Useful prompts', isFavorite: true, updatedAt });
    mockFindMany.mockResolvedValue([row] as never);
    mockCount.mockResolvedValue(1);
    const { collections } = await getAllCollections('user-1');
    expect(collections[0].name).toBe('AI Workflows');
    expect(collections[0].description).toBe('Useful prompts');
    expect(collections[0].isFavorite).toBe(true);
    expect(collections[0].updatedAt).toEqual(updatedAt);
  });

  it('returns correct totalCount', async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(42);
    const { totalCount } = await getAllCollections('user-1');
    expect(totalCount).toBe(42);
  });
});

// ─── getCollectionById ───────────────────────────────────────────────────────

describe('getCollectionById', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns null when collection is not found', async () => {
    mockFindFirst.mockResolvedValue(null);
    const result = await getCollectionById('user-1', 'nonexistent-id');
    expect(result).toBeNull();
  });

  it('scopes query to both userId and id', async () => {
    mockFindFirst.mockResolvedValue(null);
    await getCollectionById('user-42', 'col-99');
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'col-99', userId: 'user-42' } })
    );
  });

  it('returns collection with mapped items', async () => {
    const item = makeItem(snippetType);
    const row = {
      ...makeCollectionRow({ id: 'col-1', name: 'React Patterns' }),
      items: [{ item }],
      _count: { items: 1 },
    };
    mockFindFirst.mockResolvedValue(row as never);
    const result = await getCollectionById('user-1', 'col-1');
    expect(result).not.toBeNull();
    expect(result!.name).toBe('React Patterns');
    expect(result!.items).toHaveLength(1);
    expect(result!.items[0].id).toBe(item.id);
    expect(result!.items[0].itemType.name).toBe('snippet');
  });

  it('returns itemCount equal to number of items in the collection', async () => {
    const row = {
      ...makeCollectionRow({ id: 'col-1' }),
      items: [
        { item: makeItem(snippetType) },
        { item: makeItem(promptType) },
      ],
      _count: { items: 2 },
    };
    mockFindFirst.mockResolvedValue(row as never);
    const result = await getCollectionById('user-1', 'col-1');
    expect(result!.itemCount).toBe(2);
  });
});
