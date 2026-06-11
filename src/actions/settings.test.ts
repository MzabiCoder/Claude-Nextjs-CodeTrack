import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveEditorPreferences } from './settings';
import { DEFAULT_EDITOR_PREFERENCES } from '@/types/editor';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/prisma', () => ({
  prisma: { user: { update: vi.fn() } },
}));

const { auth } = await import('@/auth');
const { prisma } = await import('@/lib/prisma');
const mockAuth = vi.mocked(auth);
const mockUpdate = vi.mocked(prisma.user.update);

const validPrefs = { ...DEFAULT_EDITOR_PREFERENCES };

beforeEach(() => {
  vi.clearAllMocks();
});

describe('saveEditorPreferences', () => {
  it('returns Unauthorized when not signed in', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const result = await saveEditorPreferences(validPrefs);
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('returns Unauthorized when session has no user id', async () => {
    mockAuth.mockResolvedValueOnce({ user: {} } as never);
    const result = await saveEditorPreferences(validPrefs);
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('returns success and calls prisma update on valid input', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'user-1' } } as never);
    mockUpdate.mockResolvedValueOnce({} as never);
    const result = await saveEditorPreferences(validPrefs);
    expect(result).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { editorPreferences: validPrefs },
    });
  });

  it('returns error for invalid fontSize', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'user-1' } } as never);
    const result = await saveEditorPreferences({ ...validPrefs, fontSize: 5 });
    expect(result).toEqual({ success: false, error: 'Invalid preferences' });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('returns error for invalid theme', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'user-1' } } as never);
    const result = await saveEditorPreferences({ ...validPrefs, theme: 'solarized' as never });
    expect(result).toEqual({ success: false, error: 'Invalid preferences' });
  });

  it('returns error for invalid tabSize', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'user-1' } } as never);
    const result = await saveEditorPreferences({ ...validPrefs, tabSize: 3 });
    expect(result).toEqual({ success: false, error: 'Invalid preferences' });
  });

  it('accepts all valid themes', async () => {
    for (const theme of ['vs-dark', 'monokai', 'github-dark'] as const) {
      mockAuth.mockResolvedValueOnce({ user: { id: 'user-1' } } as never);
      mockUpdate.mockResolvedValueOnce({} as never);
      const result = await saveEditorPreferences({ ...validPrefs, theme });
      expect(result).toEqual({ success: true });
    }
  });
});
