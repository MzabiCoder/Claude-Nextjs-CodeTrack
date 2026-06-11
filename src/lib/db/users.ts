import { prisma } from '@/lib/prisma';

export type UserInfo = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  isPro: boolean;
};

export type UserForSettings = UserInfo & {
  hasPassword: boolean;
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
    },
  });
  if (!user) return null;
  const { password, ...rest } = user;
  return { ...rest, hasPassword: !!password };
}
