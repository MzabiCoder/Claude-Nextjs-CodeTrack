---
name: DevStash Architecture Patterns
description: Key architectural decisions, conventions, and recurring patterns found in this codebase
type: project
---

## Stack
- Next.js 16, React 19, TypeScript strict mode
- Prisma 7 with PrismaNeon adapter (serverless Neon Postgres)
- Tailwind CSS v4 (CSS `@theme` in globals.css — NO tailwind.config.ts)
- shadcn/ui components backed by @base-ui/react primitives (NOT Radix UI)
- No NextAuth implemented yet (auth is planned but not wired up)
- No API routes implemented yet (only DB query functions and Server Components)

## File Organization Conventions
- DB query functions: `src/lib/db/[feature].ts`
- UI components: `src/components/[feature]/ComponentName.tsx`
- Prisma client singleton: `src/lib/prisma.ts`
- Generated Prisma client: `src/generated/prisma/` (gitignored)
- Seed data: `prisma/seed.ts`

## Data Fetching Patterns
- Server components fetch directly via Prisma (correct pattern)
- `getDashboardCollections`, `getDashboardStats` in `src/lib/db/collections.ts`
- `getPinnedItems`, `getRecentItems` in `src/lib/db/items.ts`
- `getSidebarData` in `src/lib/db/sidebar.ts`
- Dashboard page uses `Promise.all` to parallelize 4 queries (good pattern)

## Known Issues from First Audit
- All DB queries have NO userId filter — all data from all users is returned (critical when auth lands)
- `getDashboardCollections` returns ALL collections (no `take` limit) — potential large payload
- `getSidebarData` eagerly loads all collections with full item+itemType joins (expensive)
- User avatar in Sidebar is hardcoded to "D" / "Demo User" / "demo@devstash.io"
- Sidebar link for types generates `/items/links` correctly but pluralization is naive (e.g., "files" → `/items/files` is fine, but logic is just appending "s")
- Missing `loading.tsx` for dashboard route
- `src/app/page.tsx` root page has no redirect to `/dashboard`
- Metadata in `src/app/layout.tsx` is still the Next.js default boilerplate
- `prisma/seed.ts` hardcodes demo password "12345678" — acceptable for dev seed only
