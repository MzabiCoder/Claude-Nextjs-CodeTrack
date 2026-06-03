import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteItem } from './items';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/db/items', () => ({
  deleteItemById: vi.fn(),
  updateItemById: vi.fn(),
}));

const { auth } = await import('@/auth');
const { deleteItemById } = await import('@/lib/db/items');
const mockAuth = vi.mocked(auth);
const mockDeleteItemById = vi.mocked(deleteItemById);

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
