import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { BillingContent } from './BillingContent';

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPro: true, stripeCustomerId: true },
  });
  if (!user) redirect('/sign-in');

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
