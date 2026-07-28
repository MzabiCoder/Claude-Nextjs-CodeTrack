import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateAutoTags } from './ai';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/gates', () => ({
  getUserIsPro: vi.fn(),
}));
vi.mock('@/lib/openai', () => ({
  AI_MODEL: 'gpt-5-nano',
  openai: {
    responses: {
      create: vi.fn(),
    },
  },
}));
vi.mock('@/lib/rate-limit', () => ({
  rateLimiters: { aiAutoTag: {} },
  checkRateLimit: vi.fn(),
}));

const { auth } = await import('@/auth');
const { getUserIsPro } = await import('@/lib/gates');
const { openai } = await import('@/lib/openai');
const { checkRateLimit } = await import('@/lib/rate-limit');

const mockAuth = vi.mocked(auth);
const mockGetUserIsPro = vi.mocked(getUserIsPro);
const mockResponsesCreate = vi.mocked(openai.responses.create);
const mockCheckRateLimit = vi.mocked(checkRateLimit);

const validInput = { title: 'useAuth hook', content: 'const useAuth = () => {}', typeName: 'snippet' };

describe('generateAutoTags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue({ limited: false, retryAfter: 0 });
  });

  it('returns unauthorized when there is no session', async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await generateAutoTags(validInput);
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('returns unauthorized when session has no user id', async () => {
    mockAuth.mockResolvedValue({ user: {} } as never);
    const result = await generateAutoTags(validInput);
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('returns pro-only error for free users', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockGetUserIsPro.mockResolvedValue(false);
    const result = await generateAutoTags(validInput);
    expect(result).toEqual({ success: false, error: 'AI features require a Pro subscription.' });
  });

  it('returns rate limit error when limit is exceeded', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockGetUserIsPro.mockResolvedValue(true);
    mockCheckRateLimit.mockResolvedValue({ limited: true, retryAfter: 3600 });
    const result = await generateAutoTags(validInput);
    expect(result).toEqual({ success: false, error: 'AI rate limit reached. Try again in 60 minutes.' });
  });

  it('returns tags from {"tags": [...]} response format', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockGetUserIsPro.mockResolvedValue(true);
    mockResponsesCreate.mockResolvedValue({ output_text: '{"tags":["react","hooks","auth"]}' } as never);
    const result = await generateAutoTags(validInput);
    expect(result).toEqual({ success: true, tags: ['react', 'hooks', 'auth'] });
  });

  it('returns tags from array response format', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockGetUserIsPro.mockResolvedValue(true);
    mockResponsesCreate.mockResolvedValue({ output_text: '["react","hooks","auth"]' } as never);
    const result = await generateAutoTags(validInput);
    expect(result).toEqual({ success: true, tags: ['react', 'hooks', 'auth'] });
  });

  it('normalizes tags to lowercase', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockGetUserIsPro.mockResolvedValue(true);
    mockResponsesCreate.mockResolvedValue({ output_text: '{"tags":["React","TypeScript","HOOKS"]}' } as never);
    const result = await generateAutoTags(validInput);
    expect(result).toEqual({ success: true, tags: ['react', 'typescript', 'hooks'] });
  });

  it('caps tags at 5', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockGetUserIsPro.mockResolvedValue(true);
    mockResponsesCreate.mockResolvedValue({
      output_text: '{"tags":["a","b","c","d","e","f","g"]}',
    } as never);
    const result = await generateAutoTags(validInput);
    expect(result).toEqual({ success: true, tags: ['a', 'b', 'c', 'd', 'e'] });
  });

  it('returns error when AI returns invalid JSON', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockGetUserIsPro.mockResolvedValue(true);
    mockResponsesCreate.mockResolvedValue({ output_text: 'not json' } as never);
    const result = await generateAutoTags(validInput);
    expect(result).toEqual({ success: false, error: 'AI returned invalid response' });
  });

  it('returns error when AI returns unexpected JSON shape', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockGetUserIsPro.mockResolvedValue(true);
    mockResponsesCreate.mockResolvedValue({ output_text: '{"result":"ok"}' } as never);
    const result = await generateAutoTags(validInput);
    expect(result).toEqual({ success: false, error: 'AI returned invalid response' });
  });

  it('returns service error when openai throws', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockGetUserIsPro.mockResolvedValue(true);
    mockResponsesCreate.mockRejectedValue(new Error('network error'));
    const result = await generateAutoTags(validInput);
    expect(result).toEqual({ success: false, error: 'AI service error. Please try again.' });
  });

  it('truncates content to 2000 chars before sending to AI', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
    mockGetUserIsPro.mockResolvedValue(true);
    mockResponsesCreate.mockResolvedValue({ output_text: '{"tags":["test"]}' } as never);
    const longContent = 'x'.repeat(3000);
    await generateAutoTags({ ...validInput, content: longContent });
    const callArg = mockResponsesCreate.mock.calls[0][0] as { input: string };
    expect(callArg.input).toContain('x'.repeat(2000));
    expect(callArg.input).not.toContain('x'.repeat(2001));
  });
});
