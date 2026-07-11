# Stripe Integration Plan — DevStash Pro

**Pricing:** $8/month · $72/year  
**Free limits:** 50 items, 3 collections  
**Pro-only:** file/image uploads, AI features, data export

---

## Current State

| What | Status |
|---|---|
| `User.isPro` / `stripeCustomerId` / `stripeSubscriptionId` | Schema already has all 3 |
| `.env` vars (`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_MONTHLY`, `STRIPE_PRICE_ID_YEARLY`) | Already in `.env.example` |
| `getUserById` / `getUserForSettings` | Both already select `isPro` |
| `Session.user.isPro` | **Missing** — only `id` is extended |
| `src/lib/stripe.ts` | **Does not exist** |
| Checkout / portal / webhook routes | **Do not exist** |
| Feature gating in `createItem`, `POST /api/collections`, `POST /api/upload` | **Not enforced** |
| `/billing` page | **Does not exist** |

---

## Stripe Dashboard Setup

1. **Create products:**
   - Product: *DevStash Pro Monthly* → Price: $8.00/month recurring → copy Price ID → `STRIPE_PRICE_ID_MONTHLY`
   - Product: *DevStash Pro Yearly* → Price: $72.00/year recurring → copy Price ID → `STRIPE_PRICE_ID_YEARLY`

2. **Customer portal:** Stripe Dashboard → Billing → Customer Portal → Enable "Allow customers to cancel" and "View invoices" → Save

3. **Webhook:** Stripe Dashboard → Developers → Webhooks → Add endpoint  
   URL: `https://<your-domain>/api/webhooks/stripe`  
   Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`  
   Copy signing secret → `STRIPE_WEBHOOK_SECRET`

---

## Implementation Order

1. `src/lib/stripe.ts` — singleton client
2. `src/types/next-auth.d.ts` — add `isPro` to Session type
3. `src/auth.ts` — sync `isPro` from DB on every JWT validation
4. `SessionUser` type + `DashboardShell` — pass `isPro` down
5. `POST /api/stripe/checkout` — create Stripe Checkout session
6. `GET /api/stripe/portal` — create Customer Portal session
7. `POST /api/webhooks/stripe` — handle subscription lifecycle events
8. `src/lib/gates.ts` — feature gate helpers
9. Gate `createItem` action (50-item limit + file/image pro check)
10. Gate `POST /api/collections` (3-collection limit)
11. Gate `POST /api/upload` (pro only)
12. `/billing` page — plan status + upgrade/manage buttons
13. Billing section in `/settings`
14. `NewItemDialog` — lock file/image types for free users

---

## Files to Create

### 1. `src/lib/stripe.ts`

```ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});
```

Install: `npm install stripe`

---

### 2. `src/app/api/stripe/checkout/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

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

  // Create or reuse Stripe customer
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email! });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const origin = req.headers.get('origin') ?? process.env.NEXTAUTH_URL!;
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/billing?success=true`,
    cancel_url: `${origin}/billing?canceled=true`,
    metadata: { userId: session.user.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
```

---

### 3. `src/app/api/stripe/portal/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });
  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: 'No billing account found' }, { status: 404 });
  }

  const origin = req.headers.get('origin') ?? process.env.NEXTAUTH_URL!;
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${origin}/billing`,
  });

  return NextResponse.json({ url: portalSession.url });
}
```

---

### 4. `src/app/api/webhooks/stripe/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
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
```

> The webhook endpoint must NOT be behind auth middleware. The `src/proxy.ts` matcher already excludes `/api/**` routes — no change needed.

---

### 5. `src/lib/gates.ts`

```ts
import { prisma } from '@/lib/prisma';

export const FREE_ITEM_LIMIT = 50;
export const FREE_COLLECTION_LIMIT = 3;
export const PRO_ONLY_TYPES = new Set(['file', 'image']);

export async function getUserItemCount(userId: string): Promise<number> {
  return prisma.item.count({ where: { userId } });
}

export async function getUserCollectionCount(userId: string): Promise<number> {
  return prisma.collection.count({ where: { userId } });
}

export async function getUserIsPro(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true },
  });
  return user?.isPro ?? false;
}
```

---

### 6. `/billing` page

**`src/app/billing/page.tsx`**

```tsx
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { BillingContent } from './BillingContent';

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPro: true, stripeCustomerId: true, stripeSubscriptionId: true },
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
      />
    </div>
  );
}
```

**`src/app/billing/BillingContent.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface BillingContentProps {
  isPro: boolean;
  hasStripeCustomer: boolean;
}

export function BillingContent({ isPro, hasStripeCustomer }: BillingContentProps) {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  async function handleCheckout(priceId: string) {
    setLoading(true);
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(false);
  }

  async function handlePortal() {
    setLoading(true);
    const res = await fetch('/api/stripe/portal');
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(false);
  }

  return (
    <div className="space-y-4">
      {success && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-500 flex items-center gap-2">
          <Check className="h-4 w-4" /> You're now on DevStash Pro. Enjoy!
        </div>
      )}
      {canceled && (
        <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          Checkout canceled. Your plan was not changed.
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">{isPro ? 'DevStash Pro' : 'DevStash Free'}</p>
            <p className="text-sm text-muted-foreground">
              {isPro ? 'Unlimited items and all features' : '50 items · 3 collections'}
            </p>
          </div>
          {isPro && (
            <span className="text-xs font-semibold text-primary border border-primary/30 bg-primary/10 rounded-full px-2.5 py-1">
              Active
            </span>
          )}
        </div>

        {isPro ? (
          <Button variant="outline" onClick={handlePortal} disabled={loading}>
            {loading ? 'Loading...' : 'Manage subscription'}
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY!)}
              disabled={loading}
            >
              Upgrade — $8/month
            </Button>
            <Button
              variant="outline"
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY!)}
              disabled={loading}
            >
              Upgrade — $72/year
              <span className="ml-1.5 text-[10px] font-semibold text-green-500">Save 25%</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
```

> **Note:** The `BillingContent` component uses `NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY` and `NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY` (public env vars exposed to the browser) to pass price IDs to the checkout handler. Add these to `.env` alongside the existing private vars. The private `STRIPE_PRICE_ID_*` vars are used server-side in the webhook and checkout API for validation — the public ones just pass the selection from the client.

---

## Files to Modify

### 7. `src/types/next-auth.d.ts` — add `isPro` to Session

```ts
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isPro: boolean;        // ← add this
    } & DefaultSession["user"];
  }
  interface JWT {
    isPro?: boolean;         // ← add this
  }
}
```

---

### 8. `src/auth.ts` — sync `isPro` from DB on every JWT validation

Add the `jwt` callback after the existing `session` callback:

```ts
callbacks: {
  session({ session, token }) {
    if (token.sub) {
      session.user.id = token.sub;
    }
    if (token.isPro !== undefined) {
      session.user.isPro = token.isPro as boolean;
    }
    return session;
  },
  async jwt({ token, user }) {
    if (user) {
      token.sub = user.id;
    }
    // Always sync isPro from DB — catches webhook updates without requiring trigger:"update"
    if (token.sub) {
      const dbUser = await prisma.user.findUnique({
        where: { id: token.sub },
        select: { isPro: true },
      });
      token.isPro = dbUser?.isPro ?? false;
    }
    return token;
  },
},
```

Also add `isPro` to the import of `prisma` (already imported at the top of `auth.ts`).

> This adds one `SELECT isPro FROM users WHERE id = ?` per session token validation. It's a single-column, indexed-by-PK lookup — negligible cost, and it guarantees the session stays in sync after the Stripe webhook updates the DB.

---

### 9. `src/components/dashboard/DashboardShell.tsx` — add `isPro` to `SessionUser`

```ts
export interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isPro?: boolean;           // ← add
}
```

All layouts that construct `SessionUser` from the NextAuth session already get `isPro` via the updated `session.user.isPro` field — no layout changes needed beyond passing it.

---

### 10. `src/actions/items.ts` — gate `createItem`

Add these checks inside `createItem`, right after input validation and before calling `createItemInDb`:

```ts
import { getUserItemCount, getUserIsPro, FREE_ITEM_LIMIT, PRO_ONLY_TYPES } from '@/lib/gates';

// Pro-only type check
if (PRO_ONLY_TYPES.has(parsed.data.typeName)) {
  const isPro = await getUserIsPro(session.user.id);
  if (!isPro) {
    return { success: false, error: 'File and image uploads require a Pro subscription.' };
  }
}

// Free tier item limit
const isPro = await getUserIsPro(session.user.id);
if (!isPro) {
  const count = await getUserItemCount(session.user.id);
  if (count >= FREE_ITEM_LIMIT) {
    return { success: false, error: `Free plan is limited to ${FREE_ITEM_LIMIT} items. Upgrade to Pro for unlimited items.` };
  }
}
```

> For types that are NOT file/image, you can share the single `getUserIsPro` call. Simplest approach: fetch `isPro` once at the top of the gate block.

---

### 11. `src/app/api/collections/route.ts` — gate `POST`

Add inside the `POST` handler, after the name validation:

```ts
import { getUserCollectionCount, getUserIsPro, FREE_COLLECTION_LIMIT } from '@/lib/gates';

const isPro = await getUserIsPro(session.user.id);
if (!isPro) {
  const count = await getUserCollectionCount(session.user.id);
  if (count >= FREE_COLLECTION_LIMIT) {
    return NextResponse.json(
      { error: `Free plan is limited to ${FREE_COLLECTION_LIMIT} collections. Upgrade to Pro for unlimited collections.` },
      { status: 403 }
    );
  }
}
```

---

### 12. `src/app/api/upload/route.ts` — pro-only gate

Add after the auth check at the top of `POST`:

```ts
import { getUserIsPro } from '@/lib/gates';

const isPro = await getUserIsPro(session.user.id);
if (!isPro) {
  return NextResponse.json({ error: 'File and image uploads require a Pro subscription.' }, { status: 403 });
}
```

---

### 13. `src/app/settings/page.tsx` — add Billing section

```tsx
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

// Inside the returned JSX, after EditorPreferencesSection:
<div className="rounded-lg border border-border p-5 space-y-3">
  <div>
    <h2 className="font-semibold">Billing</h2>
    <p className="text-sm text-muted-foreground">
      {user.isPro ? 'You are on DevStash Pro.' : 'You are on the free plan.'}
    </p>
  </div>
  <Link href="/billing" className={buttonVariants({ variant: user.isPro ? 'outline' : 'default' })}>
    {user.isPro ? 'Manage subscription' : 'Upgrade to Pro'}
  </Link>
</div>
```

Also add `isPro` to what `getUserForSettings` already returns — it's already selected via `UserInfo` which includes `isPro: true`. No change to `users.ts` needed.

---

### 14. `src/components/dashboard/NewItemDialog.tsx` — lock file/image for free users

Pass `isPro: boolean` as a prop and disable the file/image type buttons with a lock tooltip:

```tsx
interface NewItemDialogProps {
  open: boolean;
  onClose: () => void;
  isPro: boolean;   // ← add
}

// In the type selector, for 'file' and 'image':
<button
  key={type.name}
  disabled={!isPro && (type.name === 'file' || type.name === 'image')}
  aria-pressed={selected === type.name}
  title={!isPro && (type.name === 'file' || type.name === 'image') ? 'Pro feature' : undefined}
  onClick={() => !(!isPro && PRO_ONLY_TYPES.has(type.name)) && setSelected(type.name)}
  className={`... ${!isPro && PRO_ONLY_TYPES.has(type.name) ? 'opacity-40 cursor-not-allowed' : ''}`}
>
  {/* existing icon + label */}
  {!isPro && PRO_ONLY_TYPES.has(type.name) && <Lock className="h-3 w-3 ml-auto" />}
</button>
```

Wire `isPro` from `DashboardShell` → `NewItemDialog` (already receives the dialog open state).

---

### 15. `src/proxy.ts` — protect `/billing`

Add `/billing` to the protected routes:

```ts
const isOnBilling = req.nextUrl.pathname.startsWith("/billing");

if ((isOnDashboard || isOnProfile || isOnSettings || isOnItems || isOnCollections || isOnFavorites || isOnBilling) && !isLoggedIn) {
```

---

### 16. `.env.example` — add public price ID vars

```
NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY=""
NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY=""
```

---

## Testing Checklist

### Stripe CLI local testing
```bash
# Install Stripe CLI, then:
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# In another terminal:
stripe trigger checkout.session.completed
stripe trigger customer.subscription.deleted
```

### Manual flow
- [ ] Free user: create 50 items → 51st item returns error toast
- [ ] Free user: create 3 collections → 4th returns error
- [ ] Free user: `NewItemDialog` file/image buttons are disabled with lock icon
- [ ] Free user: direct `POST /api/upload` returns 403
- [ ] Click "Upgrade — $8/month" → redirects to Stripe Checkout → complete with test card `4242 4242 4242 4242`
- [ ] After checkout: redirect to `/billing?success=true` → page shows "You're now on DevStash Pro"
- [ ] After reload: session `isPro` = true (JWT re-synced from DB)
- [ ] Pro user: file/image types enabled in `NewItemDialog`
- [ ] Pro user: upload works
- [ ] Click "Manage subscription" → Stripe portal → cancel subscription
- [ ] After webhook `customer.subscription.deleted`: `isPro = false` in DB; page reload shows Free plan
- [ ] Yearly plan checkout works with yearly price ID
- [ ] Webhook: invalid signature → 400

### Build check
```bash
npm run build
npm run test
```
