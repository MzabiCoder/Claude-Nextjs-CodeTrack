import { prisma } from '@/lib/prisma';
import { type EditorPreferences, DEFAULT_EDITOR_PREFERENCES } from '@/types/editor';

export type UserInfo = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  isPro: boolean;
};

export type UserForSettings = UserInfo & {
  hasPassword: boolean;
  editorPreferences: EditorPreferences;
};

export async function getUserById(id: string): Promise<UserInfo | null> {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isPro: true,
    },
  });
}

export async function getUserForSettings(id: string): Promise<UserForSettings | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isPro: true,
      password: true,
      editorPreferences: true,
    },
  });
  if (!user) return null;
  const { password, editorPreferences, ...rest } = user;
  const prefs = editorPreferences
    ? ({ ...DEFAULT_EDITOR_PREFERENCES, ...(editorPreferences as Partial<EditorPreferences>) } as EditorPreferences)
    : DEFAULT_EDITOR_PREFERENCES;
  return { ...rest, hasPassword: !!password, editorPreferences: prefs };
}

export async function getEditorPreferences(id: string): Promise<EditorPreferences> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { editorPreferences: true },
  });
  if (!user?.editorPreferences) return DEFAULT_EDITOR_PREFERENCES;
  return { ...DEFAULT_EDITOR_PREFERENCES, ...(user.editorPreferences as Partial<EditorPreferences>) } as EditorPreferences;
}
