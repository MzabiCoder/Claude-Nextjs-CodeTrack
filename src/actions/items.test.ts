import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteItem, createItem } from './items';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/db/items', () => ({
  deleteItemById: vi.fn(),
  updateItemById: vi.fn(),
  createItemInDb: vi.fn(),
}));

const { auth } = await import('@/auth');
const { deleteItemById, createItemInDb } = await import('@/lib/db/items');
const mockAuth = vi.mocked(auth);
const mockDeleteItemById = vi.mocked(deleteItemById);
const mockCreateItemInDb = vi.mocked(createItemInDb);

const baseCardItem = {
  id: 'item-1',
  title: 'My Snippet',
  description: null,
  isFavorite: false,
  isPinned: false,
  language: 'typescript',
  createdAt: new Date('2026-01-01'),
  tags: [],
  itemType: { id: 'type-1', name: 'snippet', icon: 'Code', color: '#3b82f6' },
};

describe('createItem', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns unauthorized when there is no session', async () => {
    mockAuth.mockResolvedValue(null);
    const result = await createItem({ typeName: 'snippet', title: 'Test', tags: [] });
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('returns unauthorized when session has no user id', async () => {
    mockAuth.mockResolvedValue({ user: {} } as never);
    const result = await createItem({ typeName: 'snippet', title: 'Test', tags: [] });
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('returns validation error when title is empty', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    const result = await createItem({ typeName: 'snippet', title: '   ', tags: [] });
    expect(result).toEqual({ success: false, error: 'Title is required' });
  });

  it('returns error when link type has no url', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    const result = await createItem({ typeName: 'link', title: 'My Link', tags: [] });
    expect(result).toEqual({ success: false, error: 'URL is required for link items' });
  });

  it('returns error when createItemInDb returns null', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockCreateItemInDb.mockResolvedValue(null);
    const result = await createItem({ typeName: 'snippet', title: 'Test', tags: [] });
    expect(result).toEqual({ success: false, error: 'Failed to create item' });
  });

  it('scopes createItemInDb to the authenticated user id', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-42' } } as never);
    mockCreateItemInDb.mockResolvedValue(baseCardItem);
    await createItem({ typeName: 'snippet', title: 'Test', tags: [] });
    expect(mockCreateItemInDb).toHaveBeenCalledWith('user-42', expect.objectContaining({ typeName: 'snippet' }));
  });

  it('returns success when item is created', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockCreateItemInDb.mockResolvedValue(baseCardItem);
    const result = await createItem({ typeName: 'snippet', title: 'Test', tags: [] });
    expect(result).toEqual({ success: true });
  });
});

describe('deleteItem', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns unauthorized when there is no session', async () => {
    mockAuth.mockResolvedValue(null);
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
    mockDeleteItemById.mockResolvedValue(false);
    const result = await deleteItem('item-1');
    expect(result).toEqual({ success: false, error: 'Item not found' });
  });

  it('scopes deleteItemById to the authenticated user id', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-42' } } as never);
    mockDeleteItemById.mockResolvedValue(true);
    await deleteItem('item-99');
    expect(mockDeleteItemById).toHaveBeenCalledWith('user-42', 'item-99');
  });

  it('returns success when item is deleted', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockDeleteItemById.mockResolvedValue(true);
    const result = await deleteItem('item-1');
    expect(result).toEqual({ success: true });
  });
});
