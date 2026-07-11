import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== 'subscription') break;
      await prisma.user.update({
        where: { stripeCustomerId: session.customer as string },
        data: {
          isPro: true,
          stripeSubscriptionId: session.subscription as string,
        },
      });
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const isActive = sub.status === 'active' || sub.status === 'trialing';
      await prisma.user.update({
        where: { stripeCustomerId: sub.customer as string },
        data: { isPro: isActive },
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.user.update({
        where: { stripeCustomerId: sub.customer as string },
        data: { isPro: false, stripeSubscriptionId: null },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
