'use server';

import { z } from 'zod';
import { getAuthUserId } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import type { ActionResult } from '@/types/actions';

const editorPreferencesSchema = z.object({
  fontSize: z.number().int().min(8).max(32),
  tabSize: z.number().int().refine((v) => [2, 4, 8].includes(v)),
  wordWrap: z.boolean(),
  minimap: z.boolean(),
  theme: z.enum(['vs-dark', 'monokai', 'github-dark']),
});

export async function saveEditorPreferences(
  data: z.infer<typeof editorPreferencesSchema>
): Promise<ActionResult> {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: 'Unauthorized' };

  const parsed = editorPreferencesSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Invalid preferences' };

  await prisma.user.update({
    where: { id: userId },
    data: { editorPreferences: parsed.data },
  });

  return { success: true };
}
