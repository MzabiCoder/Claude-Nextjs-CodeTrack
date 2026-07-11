import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { priceId } = await req.json();
  const validPriceIds = [
    process.env.STRIPE_PRICE_ID_MONTHLY!,
    process.env.STRIPE_PRICE_ID_YEARLY!,
  ];
  if (!validPriceIds.includes(priceId)) {
    return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, stripeCustomerId: true, isPro: true },
  });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (user.isPro) return NextResponse.json({ error: 'Already subscribed' }, { status: 400 });

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await getStripe().customers.create({ email: user.email! });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const origin = req.headers.get('origin') ?? process.env.NEXTAUTH_URL!;
  const checkoutSession = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/billing?success=true`,
    cancel_url: `${origin}/billing?canceled=true`,
    metadata: { userId: session.user.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
