import { prisma } from "@/lib/prisma";

export async function getProfileData(userId: string) {
  const [user, itemTypeCounts, totalCollections] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        password: true,
        createdAt: true,
      },
    }),
    prisma.itemType.findMany({
      where: { isSystem: true },
      select: {
        name: true,
        icon: true,
        color: true,
        _count: { select: { items: { where: { userId } } } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.collection.count({ where: { userId } }),
  ]);

  if (!user) return null;

  const totalItems = itemTypeCounts.reduce((sum, t) => sum + t._count.items, 0);

  return {
    user,
    stats: {
      totalItems,
      totalCollections,
      byType: itemTypeCounts.map((t) => ({
        name: t.name,
        icon: t.icon,
        color: t.color,
        count: t._count.items,
      })),
    },
  };
}
