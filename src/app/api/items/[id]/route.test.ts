import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/db/items', () => ({ getItemById: vi.fn() }));

const { auth } = await import('@/auth');
const { getItemById } = await import('@/lib/db/items');
const mockAuth = vi.mocked(auth);
const mockGetItemById = vi.mocked(getItemById);

function makeRequest(id = 'item-1') {
  return {
    req: new Request(`http://localhost/api/items/${id}`),
    ctx: { params: Promise.resolve({ id }) },
  };
}

describe('GET /api/items/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue(null as never);
    const { req, ctx } = makeRequest();
    const res = await GET(req, ctx);
    expect(res.status).toBe(401);
  });

  it('returns 401 when session has no user id', async () => {
    mockAuth.mockResolvedValue({ user: {} } as never);
    const { req, ctx } = makeRequest();
    const res = await GET(req, ctx);
    expect(res.status).toBe(401);
  });

  it('returns 404 when item is not found or belongs to another user', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockGetItemById.mockResolvedValue(null);
    const { req, ctx } = makeRequest();
    const res = await GET(req, ctx);
    expect(res.status).toBe(404);
  });

  it('scopes getItemById to the authenticated user id', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-42' } } as never);
    mockGetItemById.mockResolvedValue(null);
    const { req, ctx } = makeRequest('item-99');
    await GET(req, ctx);
    expect(mockGetItemById).toHaveBeenCalledWith('user-42', 'item-99');
  });

  it('returns 200 with item JSON when found', async () => {
    const item = { id: 'item-1', title: 'Test', tags: [], collections: [] };
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockGetItemById.mockResolvedValue(item as never);
    const { req, ctx } = makeRequest();
    const res = await GET(req, ctx);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(item);
  });
});
