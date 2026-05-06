import { Package, FolderOpen, Heart, Star } from 'lucide-react';

interface StatsCardsProps {
  totalItems: number;
  totalCollections: number;
  favoriteItems: number;
  favoriteCollections: number;
}

export function StatsCards({
  totalItems,
  totalCollections,
  favoriteItems,
  favoriteCollections,
}: StatsCardsProps) {
  const stats = [
    { label: 'Total Items', value: totalItems, Icon: Package, color: 'text-blue-500' },
    { label: 'Collections', value: totalCollections, Icon: FolderOpen, color: 'text-purple-500' },
    { label: 'Favorite Items', value: favoriteItems, Icon: Heart, color: 'text-pink-500' },
    { label: 'Favorite Collections', value: favoriteCollections, Icon: Star, color: 'text-yellow-400' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, Icon, color }) => (
        <div key={label} className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">{label}</span>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      ))}
    </div>
  );
}
