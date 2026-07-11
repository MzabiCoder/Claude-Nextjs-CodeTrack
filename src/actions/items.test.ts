import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteItem, createItem, updateItem } from './items';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/db/items', () => ({
  deleteItemById: vi.fn(),
  updateItemById: vi.fn(),
  createItemInDb: vi.fn(),
  getItemFileUrl: vi.fn(),
}));
vi.mock('@/lib/gates', () => ({
  getUserIsPro: vi.fn(),
  getUserItemCount: vi.fn(),
  FREE_ITEM_LIMIT: 50,
  PRO_ONLY_TYPES: new Set(['file', 'image']),
}));

const baseDetail = {
  id: 'item-1',
  title: 'My Snippet',
  description: null,
  content: 'code',
  url: null,
  fileUrl: null,
  fileName: null,
  fileSize: null,
  isFavorite: false,
  isPinned: false,
  language: 'typescript',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  tags: [],
  collections: [],
  itemType: { name: 'snippet', icon: 'Code', color: '#3b82f6' },
};
vi.mock('@/lib/r2', () => ({
  deleteObject: vi.fn(),
  keyFromPublicUrl: vi.fn((url: string) => url),
}));

const { auth } = await import('@/auth');
const { deleteItemById, createItemInDb, getItemFileUrl, updateItemById } = await import('@/lib/db/items');
const { getUserIsPro, getUserItemCount } = await import('@/lib/gates');
const mockAuth = vi.mocked(auth);
const mockDeleteItemById = vi.mocked(deleteItemById);
const mockCreateItemInDb = vi.mocked(createItemInDb);
const mockGetItemFileUrl = vi.mocked(getItemFileUrl);
const mockUpdateItemById = vi.mocked(updateItemById);
const mockGetUserIsPro = vi.mocked(getUserIsPro);
const mockGetUserItemCount = vi.mocked(getUserItemCount);

const baseCardItem = {
  id: 'item-1',
  title: 'My Snippet',
  description: null,
  content: null,
  url: null,
  fileUrl: null,
  fileName: null,
  fileSize: null,
  isFavorite: false,
  isPinned: false,
  language: 'typescript',
  createdAt: new Date('2026-01-01'),
  tags: [],
  itemType: { id: 'type-1', name: 'snippet', icon: 'Code', color: '#3b82f6' },
};

describe('createItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserIsPro.mockResolvedValue(true);
    mockGetUserItemCount.mockResolvedValue(0);
  });

  it('returns unauthorized when there is no session', async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await createItem({ typeName: 'snippet', title: 'Test', url: null, tags: [] });
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('returns unauthorized when session has no user id', async () => {
    mockAuth.mockResolvedValue({ user: {} } as never);
    const result = await createItem({ typeName: 'snippet', title: 'Test', url: null, tags: [] });
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('returns validation error when title is empty', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    const result = await createItem({ typeName: 'snippet', title: '   ', url: null, tags: [] });
    expect(result).toEqual({ success: false, error: 'Title is required' });
  });

  it('returns error when link type has no url', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    const result = await createItem({ typeName: 'link', title: 'My Link', url: null, tags: [] });
    expect(result).toEqual({ success: false, error: 'URL is required for link items' });
  });

  it('returns error when createItemInDb returns null', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockCreateItemInDb.mockResolvedValue(null);
    const result = await createItem({ typeName: 'snippet', title: 'Test', url: null, tags: [] });
    expect(result).toEqual({ success: false, error: 'Failed to create item' });
  });

  it('scopes createItemInDb to the authenticated user id', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-42' } } as never);
    mockCreateItemInDb.mockResolvedValue(baseCardItem);
    await createItem({ typeName: 'snippet', title: 'Test', url: null, tags: [] });
    expect(mockCreateItemInDb).toHaveBeenCalledWith('user-42', expect.objectContaining({ typeName: 'snippet' }));
  });

  it('returns success when item is created', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockCreateItemInDb.mockResolvedValue(baseCardItem);
    const result = await createItem({ typeName: 'snippet', title: 'Test', url: null, tags: [] });
    expect(result).toEqual({ success: true });
  });
});

describe('updateItem', () => {
  beforeEach(() => vi.clearAllMocks());

  const validInput = { title: 'Updated', tags: [], collectionIds: [] };

  it('returns unauthorized when there is no session', async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await updateItem('item-1', validInput);
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('returns unauthorized when session has no user id', async () => {
    mockAuth.mockResolvedValue({ user: {} } as never);
    const result = await updateItem('item-1', validInput);
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('returns validation error when title is empty', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    const result = await updateItem('item-1', { ...validInput, title: '   ' });
    expect(result).toEqual({ success: false, error: 'Title is required' });
  });

  it('returns error when updateItemById returns null', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockUpdateItemById.mockResolvedValue(null);
    const result = await updateItem('item-1', validInput);
    expect(result).toEqual({ success: false, error: 'Item not found' });
  });

  it('scopes updateItemById to the authenticated user id', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-42' } } as never);
    mockUpdateItemById.mockResolvedValue(baseDetail as never);
    await updateItem('item-99', validInput);
    expect(mockUpdateItemById).toHaveBeenCalledWith('user-42', 'item-99', expect.any(Object));
  });

  it('passes collectionIds through to updateItemById', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockUpdateItemById.mockResolvedValue(baseDetail as never);
    await updateItem('item-1', { ...validInput, collectionIds: ['col-1', 'col-2'] });
    expect(mockUpdateItemById).toHaveBeenCalledWith(
      'user-1',
      'item-1',
      expect.objectContaining({ collectionIds: ['col-1', 'col-2'] })
    );
  });

  it('returns success with updated item data', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockUpdateItemById.mockResolvedValue(baseDetail as never);
    const result = await updateItem('item-1', validInput);
    expect(result).toEqual({ success: true, data: baseDetail });
  });
});

describe('deleteItem', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns unauthorized when there is no session', async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await deleteItem('item-1');
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('returns unauthorized when session has no user id', async () => {
    mockAuth.mockResolvedValue({ user: {} } as never);
    const result = await deleteItem('item-1');
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('returns not found when item does not exist or belongs to another user', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockGetItemFileUrl.mockResolvedValue(null);
    mockDeleteItemById.mockResolvedValue(false);
    const result = await deleteItem('item-1');
    expect(result).toEqual({ success: false, error: 'Item not found' });
  });

  it('scopes deleteItemById to the authenticated user id', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-42' } } as never);
    mockGetItemFileUrl.mockResolvedValue(null);
    mockDeleteItemById.mockResolvedValue(true);
    await deleteItem('item-99');
    expect(mockDeleteItemById).toHaveBeenCalledWith('user-42', 'item-99');
  });

  it('returns success when item is deleted', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockGetItemFileUrl.mockResolvedValue(null);
    mockDeleteItemById.mockResolvedValue(true);
    const result = await deleteItem('item-1');
    expect(result).toEqual({ success: true });
  });
});
