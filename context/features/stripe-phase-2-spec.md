# Stripe Integration — Phase 2: Webhooks, Feature Gating & UI

## Overview

Wire up the three Stripe API routes (checkout, portal, webhook), enforce free-tier limits across all write paths, build the `/billing` page, and add lock icons to the `NewItemDialog`. Depends entirely on Phase 1 being merged — `isPro` must flow through the session and `gates.ts` must exist before any of this starts.

> **Stripe CLI required for local webhook testing.** See Testing section.

## Requirements

- `POST /api/stripe/checkout` — create Checkout session, redirect client to Stripe-hosted page
- `GET /api/stripe/portal` — create Customer Portal session for managing/cancelling subscriptions
- `POST /api/webhooks/stripe` — handle `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`; update `isPro` and `stripeSubscriptionId` in DB
- Gate `createItem` server action: 50-item limit + block `file`/`image` types for free users
- Gate `POST /api/collections`: 3-collection limit for free users
- Gate `POST /api/upload`: pro-only, return 403 for free users
- `/billing` page: shows current plan, upgrade buttons (monthly/yearly), or "Manage subscription" for Pro users
- `/settings` page: add Billing section with a link/button to `/billing`
- `NewItemDialog`: disable `file` and `image` type buttons for free users with lock icon + tooltip
- Protect `/billing` route in `src/proxy.ts`

## Files to Create

1. `src/app/api/stripe/checkout/route.ts` — POST handler
2. `src/app/api/stripe/portal/route.ts` — GET handler
3. `src/app/api/webhooks/stripe/route.ts` — POST handler (must not be behind auth middleware — it already isn't since `/api/**` is excluded from the proxy matcher)
4. `src/app/billing/page.tsx` — server component, fetches `isPro` + `stripeCustomerId`
5. `src/app/billing/BillingContent.tsx` — `'use client'`, handles checkout/portal redirects and `?success`/`?canceled` banners

## Files to Modify

6. `src/actions/items.ts` — gate `createItem` using `getUserIsPro` + `getUserItemCount` + `PRO_ONLY_TYPES`
7. `src/app/api/collections/route.ts` — gate `POST` using `getUserIsPro` + `getUserCollectionCount`
8. `src/app/api/upload/route.ts` — gate `POST` using `getUserIsPro`
9. `src/app/settings/page.tsx` — add Billing section after `EditorPreferencesSection`
10. `src/components/dashboard/NewItemDialog.tsx` — accept `isPro: boolean` prop; disable + lock `file`/`image` types
11. `src/proxy.ts` — add `/billing` to the protected routes list

## Implementation Notes

### Checkout route (`POST /api/stripe/checkout`)

- Validate `priceId` against `STRIPE_PRICE_ID_MONTHLY` and `STRIPE_PRICE_ID_YEARLY` (server-side private vars) — reject anything else with 400
- Create or reuse Stripe customer (`stripeCustomerId` on user); persist new customer ID immediately
- `success_url`: `${origin}/billing?success=true`; `cancel_url`: `${origin}/billing?canceled=true`
- Set `metadata: { userId }` on the checkout session

### Portal route (`GET /api/stripe/portal`)

- Return 404 if user has no `stripeCustomerId`
- `return_url`: `${origin}/billing`

### Webhook route (`POST /api/webhooks/stripe`)

- Read raw body via `req.text()` before any JSON parsing
- `stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)` — return 400 on failure
- `checkout.session.completed`: only act when `session.mode === 'subscription'`; set `isPro: true` + `stripeSubscriptionId`
- `customer.subscription.updated`: set `isPro` based on `sub.status === 'active' || sub.status === 'trialing'`
- `customer.subscription.deleted`: set `isPro: false`, clear `stripeSubscriptionId: null`
- All DB updates use `where: { stripeCustomerId }` — no JWT involved

### Feature gating in `createItem`

Fetch `isPro` once at the top of the gate block, share the result for both checks:

```ts
const isPro = await getUserIsPro(session.user.id);
if (PRO_ONLY_TYPES.has(parsed.data.typeName) && !isPro) {
  return { success: false, error: 'File and image uploads require a Pro subscription.' };
}
if (!isPro) {
  const count = await getUserItemCount(session.user.id);
  if (count >= FREE_ITEM_LIMIT) {
    return { success: false, error: `Free plan is limited to ${FREE_ITEM_LIMIT} items. Upgrade to Pro for unlimited items.` };
  }
}
```

### `BillingContent` client component

- Uses `NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY` and `NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY` (public env vars) to pass the selected price to the checkout handler — the server validates them against the private vars
- `?success=true` → green banner ("You're now on DevStash Pro. Enjoy!")
- `?canceled=true` → neutral banner ("Checkout canceled. Your plan was not changed.")
- Single `loading` state covers both checkout and portal button clicks

### `NewItemDialog` changes

- Add `isPro: boolean` prop to `NewItemDialogProps`
- For type buttons where `type.name === 'file' || type.name === 'image'`:
  - `disabled={!isPro && PRO_ONLY_TYPES.has(type.name)}`
  - `title={!isPro ? 'Pro feature' : undefined}`
  - `className` adds `opacity-40 cursor-not-allowed` when locked
  - Render a `<Lock className="h-3 w-3 ml-auto" />` inside the button when locked
- Wire `isPro` from `DashboardShell` → `NewItemDialog` (it already receives `newItemOpen` state)

### Settings billing section

Add after the existing account action sections in `src/app/settings/page.tsx`:

```tsx
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

`getUserForSettings` already selects `isPro` — no DB change needed.

### Proxy protection

```ts
const isOnBilling = req.nextUrl.pathname.startsWith("/billing");
// add isOnBilling to the existing condition
```

## Environment Variables

These must be set locally before testing:

```
STRIPE_SECRET_KEY=""                      # from Stripe Dashboard → API keys
STRIPE_PUBLISHABLE_KEY=""                 # from Stripe Dashboard → API keys
STRIPE_WEBHOOK_SECRET=""                  # from stripe listen output or Dashboard
STRIPE_PRICE_ID_MONTHLY=""               # server-side validation
STRIPE_PRICE_ID_YEARLY=""                # server-side validation
NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY=""   # passed from client to checkout handler
NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY=""    # passed from client to checkout handler
```

## Testing

### Stripe CLI (required for webhook testing)

```bash
# Install Stripe CLI (macOS):
brew install stripe/stripe-cli/stripe

stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy the webhook signing secret printed by listen → STRIPE_WEBHOOK_SECRET

# Trigger test events in a second terminal:
stripe trigger checkout.session.completed
stripe trigger customer.subscription.deleted
```

### Manual flow checklist

**Free tier limits**
- [ ] Create 50 items → attempt 51st → error toast: "Free plan is limited to 50 items..."
- [ ] Create 3 collections → attempt 4th → error: "Free plan is limited to 3 collections..."
- [ ] `NewItemDialog`: file and image type buttons are disabled with lock icon and "Pro feature" tooltip
- [ ] `POST /api/upload` directly → 403 with `{ error: 'File and image uploads require a Pro subscription.' }`

**Checkout flow**
- [ ] Click "Upgrade — $8/month" → redirects to Stripe Checkout
- [ ] Complete with test card `4242 4242 4242 4242`, any future date, any CVC
- [ ] After checkout: redirected to `/billing?success=true` → green banner visible
- [ ] Reload `/billing` → banner gone, plan shows "DevStash Pro — Active"
- [ ] Next page load: `session.user.isPro === true` (JWT re-synced from DB)

**Pro user behavior**
- [ ] File and image type buttons enabled in `NewItemDialog`
- [ ] Upload works end-to-end
- [ ] `/settings` Billing section shows "Manage subscription" button (outline variant)

**Cancel flow**
- [ ] Click "Manage subscription" → Stripe portal opens
- [ ] Cancel subscription in portal → returns to `/billing`
- [ ] `stripe trigger customer.subscription.deleted` fires → DB sets `isPro: false`
- [ ] Reload → plan shows "DevStash Free"

**Yearly plan**
- [ ] "Upgrade — $72/year" → Stripe Checkout with yearly price → completes successfully

**Webhook security**
- [ ] Send POST to `/api/webhooks/stripe` with no `stripe-signature` header → 400
- [ ] Send with invalid signature → 400

**Build**
```bash
npm run build
npm run test
```

## Notes

- Do NOT put webhook route behind any auth middleware. The proxy already excludes `/api/**` — no change needed there.
- The `BillingContent` uses `window.location.href` (not `router.push`) intentionally — a full navigation is needed to exit the Stripe-hosted checkout flow cleanly.
- `NEXT_PUBLIC_` price IDs are exposed to the browser intentionally; the checkout API validates them server-side against the private vars to prevent price tampering.
