# Stripe Integration — Phase 1: Core Infrastructure

## Overview

Install the Stripe SDK and wire up the session/type layer so `isPro` flows from the database into every NextAuth session. Create `src/lib/gates.ts` as the single source of truth for usage limits. No UI, no API routes, no webhooks — just the plumbing that everything else depends on.

## Requirements

- Install `stripe` npm package
- Create `src/lib/stripe.ts` singleton client
- Extend `src/types/next-auth.d.ts` with `isPro: boolean` on Session and JWT
- Add `jwt` callback to `src/auth.ts` that syncs `isPro` from DB on every token validation
- Surface `isPro` through `session` callback so `session.user.isPro` is always current
- Add `isPro?: boolean` to `SessionUser` interface in `DashboardShell`
- Create `src/lib/gates.ts` with free-tier constants and DB helper functions
- Add `NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY` and `NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY` to `.env.example`
- Unit tests for all exported functions in `gates.ts`

## Files to Create

1. `src/lib/stripe.ts` — Stripe singleton (`apiVersion: '2025-06-30.basil'`)
2. `src/lib/gates.ts` — `FREE_ITEM_LIMIT`, `FREE_COLLECTION_LIMIT`, `PRO_ONLY_TYPES`, `getUserItemCount`, `getUserCollectionCount`, `getUserIsPro`
3. `src/lib/gates.test.ts` — unit tests (see Testing section)

## Files to Modify

4. `src/types/next-auth.d.ts` — add `isPro: boolean` to `Session["user"]`; add `isPro?: boolean` to JWT interface
5. `src/auth.ts` — add `jwt` callback that reads `isPro` from DB via `prisma.user.findUnique`; update `session` callback to forward `token.isPro` onto `session.user.isPro`
6. `src/components/dashboard/DashboardShell.tsx` — add `isPro?: boolean` to `SessionUser` interface
7. `.env.example` — append `NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY=""` and `NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY=""`

## Implementation Notes

### `src/lib/stripe.ts`

```ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});
```

### `src/lib/gates.ts`

```ts
export const FREE_ITEM_LIMIT = 50;
export const FREE_COLLECTION_LIMIT = 3;
export const PRO_ONLY_TYPES = new Set(['file', 'image']);

export async function getUserItemCount(userId: string): Promise<number> { ... }
export async function getUserCollectionCount(userId: string): Promise<number> { ... }
export async function getUserIsPro(userId: string): Promise<boolean> { ... }
```

### `src/auth.ts` callbacks

Add after the existing `session` callback — do NOT replace it:

```ts
async jwt({ token, user }) {
  if (user) token.sub = user.id;
  if (token.sub) {
    const dbUser = await prisma.user.findUnique({
      where: { id: token.sub },
      select: { isPro: true },
    });
    token.isPro = dbUser?.isPro ?? false;
  }
  return token;
},
```

In the existing `session` callback, forward the flag:

```ts
if (token.isPro !== undefined) {
  session.user.isPro = token.isPro as boolean;
}
```

> **Why sync on every JWT validation?** The Stripe webhook updates `isPro` in the DB directly. Without this DB read, the user's session wouldn't reflect their new Pro status until they log out and back in.

## Environment Variables

No new secret env vars needed in Phase 1. Add the public client-side vars to `.env.example` now so they're ready for Phase 2:

```
NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY=""
NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY=""
```

The private Stripe vars are already in `.env.example`:

```
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""
STRIPE_PRICE_ID_MONTHLY=""
STRIPE_PRICE_ID_YEARLY=""
```

## Testing

Unit tests for `src/lib/gates.ts` (use `vi.mock('@/lib/prisma')`):

- `getUserItemCount` — returns the count from `prisma.item.count`
- `getUserCollectionCount` — returns the count from `prisma.collection.count`
- `getUserIsPro` — returns `true` when `isPro: true` in DB
- `getUserIsPro` — returns `false` when `isPro: false` in DB
- `getUserIsPro` — returns `false` when user not found (null)
- `PRO_ONLY_TYPES` — contains `'file'` and `'image'`, does not contain `'snippet'`

Run `npm run test` after implementation. All existing 72 tests must still pass.

## Verification

After implementation, start the dev server and verify:

1. Sign in; open DevTools → Application → Cookies — confirm `next-auth.session-token` exists
2. In the DB, set `isPro = true` on your test user directly via Neon console
3. Reload any page — next token revalidation should pick up the change (may need to wait up to the JWT max-age; sign out and back in for immediate effect)
4. `console.log(session.user.isPro)` in any server component should print `true`
