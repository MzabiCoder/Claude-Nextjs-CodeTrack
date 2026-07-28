import { prisma } from '@/lib/prisma';

export function getDominantColor(
  items: Array<{ item: { itemType: { id: string; color: string } } }>
): string {
  const counts: Record<string, { count: number; color: string }> = {};
  for (const ic of items) {
    const { id, color } = ic.item.itemType;
    if (!counts[id]) counts[id] = { count: 0, color };
    counts[id].count++;
  }
  return Object.values(counts).sort((a, b) => b.count - a.count)[0]?.color ?? '#6b7280';
}

type BooleanFieldDelegate = {
  findFirst: (args: {
    where: { id: string; userId: string };
    select: Record<string, true>;
  }) => Promise<Record<string, boolean> | null>;
  update: (args: {
    where: { id: string };
    data: Record<string, boolean>;
    select: Record<string, true>;
  }) => Promise<Record<string, boolean>>;
};

export async function toggleOwnedBooleanField(
  model: 'item' | 'collection',
  userId: string,
  id: string,
  field: string
): Promise<{ found: false } | { found: true; value: boolean }> {
  const delegate = prisma[model] as unknown as BooleanFieldDelegate;

  const record = await delegate.findFirst({
    where: { id, userId },
    select: { [field]: true },
  });
  if (!record) return { found: false };

  const updated = await delegate.update({
    where: { id },
    data: { [field]: !record[field] },
    select: { [field]: true },
  });
  return { found: true, value: updated[field] };
}
