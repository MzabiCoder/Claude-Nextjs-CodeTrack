import { prisma } from '@/lib/prisma';

export type UserInfo = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  isPro: boolean;
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
