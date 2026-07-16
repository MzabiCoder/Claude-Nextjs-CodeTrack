import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserIsPro } from '@/lib/gates';
import { UpgradeContent } from './UpgradeContent';

export default async function UpgradePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const isPro = await getUserIsPro(session.user.id);
  if (isPro) redirect('/billing');

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">Upgrade to Pro</h1>
        <p className="text-sm text-muted-foreground">
          Unlock unlimited items, file uploads, and AI features.
        </p>
      </div>
      <UpgradeContent
        monthlyPriceId={process.env.STRIPE_PRICE_ID_MONTHLY ?? ''}
        yearlyPriceId={process.env.STRIPE_PRICE_ID_YEARLY ?? ''}
      />
    </div>
  );
}
