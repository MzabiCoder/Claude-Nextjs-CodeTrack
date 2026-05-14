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
