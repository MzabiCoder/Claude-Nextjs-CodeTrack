'use server';

import { z } from 'zod';
import { getAuthUserId } from '@/lib/auth-helpers';
import { parseOrError } from '@/lib/validation';
import { getUserIsPro } from '@/lib/gates';
import { openai, AI_MODEL } from '@/lib/openai';
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit';

const generateAutoTagsSchema = z.object({
  title: z.string().trim().min(1),
  content: z.string().nullable().optional(),
  typeName: z.string().trim().min(1),
});

export type GenerateAutoTagsInput = z.infer<typeof generateAutoTagsSchema>;
export type GenerateAutoTagsResult =
  | { success: true; tags: string[] }
  | { success: false; error: string };

export async function generateAutoTags(
  data: GenerateAutoTagsInput
): Promise<GenerateAutoTagsResult> {
  const userId = await getAuthUserId();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  const isPro = await getUserIsPro(userId);
  if (!isPro) {
    return { success: false, error: 'AI features require a Pro subscription.' };
  }

  const { limited, retryAfter } = await checkRateLimit(
    rateLimiters.aiAutoTag,
    userId
  );
  if (limited) {
    const minutes = Math.max(1, Math.ceil(retryAfter / 60));
    return {
      success: false,
      error: `AI rate limit reached. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
    };
  }

  const parsed = parseOrError(generateAutoTagsSchema, data);
  if (!parsed.success) {
    return parsed;
  }

  const { title, content, typeName } = parsed.data;
  const truncatedContent = content ? content.slice(0, 2000) : '';

  try {
    const response = await openai.responses.create({
      model: AI_MODEL,
      instructions:
        'You are a developer tool assistant that generates concise, relevant tags for developer resources. Return only JSON.',
      input: `Generate 3-5 short, relevant tags for this ${typeName}:\nTitle: ${title}${truncatedContent ? `\nContent: ${truncatedContent}` : ''}\n\nRespond with JSON: {"tags": ["tag1", "tag2", "tag3"]}`,
      text: {
        format: { type: 'json_object' },
      },
    });

    const raw = response.output_text;
    let result: unknown;
    try {
      result = JSON.parse(raw);
    } catch {
      return { success: false, error: 'AI returned invalid response' };
    }

    let tags: unknown[];
    if (Array.isArray(result)) {
      tags = result;
    } else if (
      result &&
      typeof result === 'object' &&
      'tags' in result &&
      Array.isArray((result as Record<string, unknown>).tags)
    ) {
      tags = (result as { tags: unknown[] }).tags;
    } else {
      return { success: false, error: 'AI returned invalid response' };
    }

    const normalizedTags = tags
      .filter((t): t is string => typeof t === 'string' && t.length > 0)
      .map((t) => t.toLowerCase().trim())
      .slice(0, 5);

    return { success: true, tags: normalizedTags };
  } catch {
    return { success: false, error: 'AI service error. Please try again.' };
  }
}
