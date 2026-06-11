import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getEditorPreferences } from './users';
import { DEFAULT_EDITOR_PREFERENCES } from '@/types/editor';

vi.mock('@/lib/prisma', () => ({
  prisma: { user: { findUnique: vi.fn() } },
}));

const { prisma } = await import('@/lib/prisma');
const mockFindUnique = vi.mocked(prisma.user.findUnique);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getEditorPreferences', () => {
  it('returns defaults when user not found', async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    const result = await getEditorPreferences('user-1');
    expect(result).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });

  it('returns defaults when editorPreferences is null', async () => {
    mockFindUnique.mockResolvedValueOnce({ editorPreferences: null } as never);
    const result = await getEditorPreferences('user-1');
    expect(result).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });

  it('returns saved preferences merged with defaults', async () => {
    const saved = { fontSize: 16, tabSize: 4, wordWrap: false, minimap: true, theme: 'monokai' };
    mockFindUnique.mockResolvedValueOnce({ editorPreferences: saved } as never);
    const result = await getEditorPreferences('user-1');
    expect(result).toEqual(saved);
  });

  it('merges partial preferences with defaults for missing keys', async () => {
    mockFindUnique.mockResolvedValueOnce({ editorPreferences: { fontSize: 18 } } as never);
    const result = await getEditorPreferences('user-1');
    expect(result.fontSize).toBe(18);
    expect(result.tabSize).toBe(DEFAULT_EDITOR_PREFERENCES.tabSize);
    expect(result.theme).toBe(DEFAULT_EDITOR_PREFERENCES.theme);
    expect(result.wordWrap).toBe(DEFAULT_EDITOR_PREFERENCES.wordWrap);
    expect(result.minimap).toBe(DEFAULT_EDITOR_PREFERENCES.minimap);
  });

  it('queries by the provided userId', async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    await getEditorPreferences('abc-123');
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: 'abc-123' },
      select: { editorPreferences: true },
    });
  });
});
