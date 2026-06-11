'use server';

import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const editorPreferencesSchema = z.object({
  fontSize: z.number().int().min(8).max(32),
  tabSize: z.number().int().refine((v) => [2, 4, 8].includes(v)),
  wordWrap: z.boolean(),
  minimap: z.boolean(),
  theme: z.enum(['vs-dark', 'monokai', 'github-dark']),
});

type SaveResult = { success: true } | { success: false; error: string };

export async function saveEditorPreferences(
  data: z.infer<typeof editorPreferencesSchema>
): Promise<SaveResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  const parsed = editorPreferencesSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Invalid preferences' };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { editorPreferences: parsed.data },
  });

  return { success: true };
}
