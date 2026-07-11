import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/prisma', () => ({
  prisma: { collection: { create: vi.fn(), findMany: vi.fn() } },
}));
vi.mock('@/lib/gates', () => ({
  getUserIsPro: vi.fn(),
  getUserCollectionCount: vi.fn(),
  FREE_COLLECTION_LIMIT: 3,
}));

const { auth } = await import('@/auth');
const { prisma } = await import('@/lib/prisma');
const { getUserIsPro, getUserCollectionCount } = await import('@/lib/gates');
const mockAuth = vi.mocked(auth);
const mockCreate = vi.mocked(prisma.collection.create);
const mockFindMany = vi.mocked(prisma.collection.findMany);
const mockGetUserIsPro = vi.mocked(getUserIsPro);
const mockGetUserCollectionCount = vi.mocked(getUserCollectionCount);

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/collections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const stubCollection = {
  id: 'col-1',
  name: 'React Patterns',
  description: null,
  isFavorite: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const getRequest = new Request('http://localhost/api/collections');

describe('GET /api/collections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserIsPro.mockResolvedValue(true);
  });

  it('returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue(null as never);
    const res = await GET(getRequest);
    expect(res.status).toBe(401);
  });

  it('returns 401 when session has no user id', async () => {
    mockAuth.mockResolvedValue({ user: {} } as never);
    const res = await GET(getRequest);
    expect(res.status).toBe(401);
  });

  it('scopes findMany to the authenticated user id', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-42' } } as never);
    mockFindMany.mockResolvedValue([]);
    await GET(getRequest);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-42' } })
    );
  });

  it('returns 200 with the collections array', async () => {
    const cols = [{ id: 'col-1', name: 'React Patterns' }, { id: 'col-2', name: 'AI Workflows' }];
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockFindMany.mockResolvedValue(cols as never);
    const res = await GET(getRequest);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(cols);
  });
});

describe('POST /api/collections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserIsPro.mockResolvedValue(true);
    mockGetUserCollectionCount.mockResolvedValue(0);
  });

  it('returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue(null as never);
    const res = await POST(makeRequest({ name: 'Test' }));
    expect(res.status).toBe(401);
  });

  it('returns 401 when session has no user id', async () => {
    mockAuth.mockResolvedValue({ user: {} } as never);
    const res = await POST(makeRequest({ name: 'Test' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when name is missing', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Name is required');
  });

  it('returns 400 when name is blank whitespace', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    const res = await POST(makeRequest({ name: '   ' }));
    expect(res.status).toBe(400);
  });

  it('scopes collection creation to the authenticated user', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-42' } } as never);
    mockCreate.mockResolvedValue(stubCollection as never);
    await POST(makeRequest({ name: 'My Collection' }));
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: 'user-42' }) })
    );
  });

  it('trims whitespace from name before saving', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockCreate.mockResolvedValue(stubCollection as never);
    await POST(makeRequest({ name: '  React Patterns  ' }));
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ name: 'React Patterns' }) })
    );
  });

  it('passes null description when not provided', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockCreate.mockResolvedValue(stubCollection as never);
    await POST(makeRequest({ name: 'My Collection' }));
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ description: null }) })
    );
  });

  it('passes description when provided', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockCreate.mockResolvedValue({ ...stubCollection, description: 'Useful patterns' } as never);
    await POST(makeRequest({ name: 'My Collection', description: 'Useful patterns' }));
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ description: 'Useful patterns' }) })
    );
  });

  it('returns 201 with the created collection on success', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockCreate.mockResolvedValue(stubCollection as never);
    const res = await POST(makeRequest({ name: 'React Patterns' }));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.id).toBe('col-1');
    expect(data.name).toBe('React Patterns');
  });
});
