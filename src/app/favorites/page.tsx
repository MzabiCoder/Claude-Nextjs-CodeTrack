import { auth } from '@/auth';
import { getFavorites } from '@/lib/db/favorites';
import { FavoritesList } from '@/components/favorites/FavoritesList';

export default async function FavoritesPage() {
  const session = await auth();
  const userId = session?.user?.id ?? '';
  const data = await getFavorites(userId);
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-lg font-semibold mb-6">Favorites</h1>
      <FavoritesList data={data} />
    </div>
  );
}
