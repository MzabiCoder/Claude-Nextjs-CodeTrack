import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';
import { BillingContent } from './BillingContent';

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const { success } = await searchParams;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPro: true, stripeCustomerId: true },
  });
  if (!user) redirect('/sign-in');

  // Fallback sync: if redirected from successful checkout but isPro is still false,
  // confirm with Stripe directly and update the DB (handles missed/delayed webhooks)
  if (success && !user.isPro && user.stripeCustomerId) {
    const subscriptions = await getStripe().subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active',
      limit: 1,
    });
    if (subscriptions.data.length > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          isPro: true,
          stripeSubscriptionId: subscriptions.data[0].id,
        },
      });
      user.isPro = true;
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your subscription</p>
      </div>
      <BillingContent
        isPro={user.isPro}
        hasStripeCustomer={!!user.stripeCustomerId}
        monthlyPriceId={process.env.STRIPE_PRICE_ID_MONTHLY ?? ''}
        yearlyPriceId={process.env.STRIPE_PRICE_ID_YEARLY ?? ''}
      />
    </div>
  );
}
