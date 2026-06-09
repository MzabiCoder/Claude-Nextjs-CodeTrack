import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSearchData } from './search';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    item: { findMany: vi.fn() },
    collection: { findMany: vi.fn() },
  },
}));

const { prisma } = await import('@/lib/prisma');
const mockItemFindMany = vi.mocked(prisma.item.findMany);
const mockColFindMany = vi.mocked(prisma.collection.findMany);

const snippetType = { name: 'snippet', icon: 'Code', color: '#3b82f6' };

function makeDbItem(overrides: {
  id?: string;
  title?: string;
  content?: string | null;
  url?: string | null;
  fileName?: string | null;
  itemType?: typeof snippetType;
}) {
  return {
    id: overrides.id ?? 'item-1',
    title: overrides.title ?? 'My Item',
    content: overrides.content ?? null,
    url: overrides.url ?? null,
    fileName: overrides.fileName ?? null,
    itemType: overrides.itemType ?? snippetType,
  };
}

function makeDbCollection(overrides: { id?: string; name?: string; count?: number }) {
  return {
    id: overrides.id ?? 'col-1',
    name: overrides.name ?? 'React Patterns',
    _count: { items: overrides.count ?? 3 },
  };
}

beforeEach(() => vi.clearAllMocks());

// ─── getSearchData ────────────────────────────────────────────────────────────

describe('getSearchData', () => {
  it('returns mapped items and collections', async () => {
    mockItemFindMany.mockResolvedValue([makeDbItem({ content: 'console.log("hi")' })] as never);
    mockColFindMany.mockResolvedValue([makeDbCollection({})] as never);

    const result = await getSearchData('user-1');

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      id: 'item-1',
      title: 'My Item',
      typeName: 'snippet',
      typeIcon: 'Code',
      typeColor: '#3b82f6',
    });
    expect(result.collections).toHaveLength(1);
    expect(result.collections[0]).toEqual({ id: 'col-1', name: 'React Patterns', itemCount: 3 });
  });

  it('queries with the provided userId', async () => {
    mockItemFindMany.mockResolvedValue([] as never);
    mockColFindMany.mockResolvedValue([] as never);

    await getSearchData('user-abc');

    expect(mockItemFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-abc' } })
    );
    expect(mockColFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-abc' } })
    );
  });

  it('contentPreview uses content when present', async () => {
    mockItemFindMany.mockResolvedValue([
      makeDbItem({ content: 'hello world', url: 'https://example.com', fileName: 'file.txt' }),
    ] as never);
    mockColFindMany.mockResolvedValue([] as never);

    const { items } = await getSearchData('u');
    expect(items[0].contentPreview).toBe('hello world');
  });

  it('contentPreview falls back to url when content is null', async () => {
    mockItemFindMany.mockResolvedValue([
      makeDbItem({ content: null, url: 'https://example.com', fileName: 'file.txt' }),
    ] as never);
    mockColFindMany.mockResolvedValue([] as never);

    const { items } = await getSearchData('u');
    expect(items[0].contentPreview).toBe('https://example.com');
  });

  it('contentPreview falls back to fileName when content and url are null', async () => {
    mockItemFindMany.mockResolvedValue([
      makeDbItem({ content: null, url: null, fileName: 'report.pdf' }),
    ] as never);
    mockColFindMany.mockResolvedValue([] as never);

    const { items } = await getSearchData('u');
    expect(items[0].contentPreview).toBe('report.pdf');
  });

  it('contentPreview is null when all sources are null', async () => {
    mockItemFindMany.mockResolvedValue([
      makeDbItem({ content: null, url: null, fileName: null }),
    ] as never);
    mockColFindMany.mockResolvedValue([] as never);

    const { items } = await getSearchData('u');
    expect(items[0].contentPreview).toBeNull();
  });

  it('truncates content preview to 80 characters', async () => {
    const longContent = 'a'.repeat(120);
    mockItemFindMany.mockResolvedValue([makeDbItem({ content: longContent })] as never);
    mockColFindMany.mockResolvedValue([] as never);

    const { items } = await getSearchData('u');
    expect(items[0].contentPreview).toHaveLength(80);
  });

  it('returns empty arrays when user has no data', async () => {
    mockItemFindMany.mockResolvedValue([] as never);
    mockColFindMany.mockResolvedValue([] as never);

    const result = await getSearchData('new-user');
    expect(result.items).toEqual([]);
    expect(result.collections).toEqual([]);
  });
});
