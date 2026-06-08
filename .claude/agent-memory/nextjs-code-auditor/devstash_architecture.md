---
name: DevStash Architecture Patterns
description: Key architectural decisions, conventions, and recurring patterns found in this codebase
type: project
---

## Stack
- Next.js 16, React 19, TypeScript strict mode
- Prisma 7 with PrismaNeon adapter (serverless Neon Postgres)
- Tailwind CSS v4 (CSS `@theme` in globals.css — NO tailwind.config.ts)
- shadcn/ui components
- NextAuth v5 with GitHub OAuth + Credentials provider (JWT strategy, PrismaAdapter)
- Upstash Redis for rate limiting (sliding window)
- Cloudflare R2 for file/image storage via @aws-sdk/client-s3
- Email verification + forgot-password via VerificationToken table (reused with `reset:` prefix)
- Resend for transactional email

## File Organization Conventions
- DB query functions: `src/lib/db/[feature].ts`
- UI components: `src/components/[feature]/ComponentName.tsx`
- Server Actions: `src/actions/[feature].ts`
- API Routes: `src/app/api/[feature]/route.ts`
- Prisma client singleton: `src/lib/prisma.ts`
- Generated Prisma client: `src/generated/prisma/` (gitignored)
- Seed data: `prisma/seed.ts`

## Auth Patterns
- Middleware in `src/proxy.ts` guards `/dashboard/*`, `/profile/*`, `/items/*`
- All API routes that touch user data call `auth()` at the top and return 401 if no session
- `session.user.id` is set via JWT callback from `token.sub`
- Login rate limit uses `{ip}:{email}` as key (combined key, not just IP)

## Data Fetching Patterns
- Server components fetch directly via Prisma (correct pattern)
- Client components fetch via Server Actions (for mutations) or fetch() to API routes
- Dashboard page uses `Promise.all` to parallelize 4 queries
- ItemDrawer uses `fetch(/api/items/[id])` client-side to load item detail on open
- `itemSelect` const + `mapItem` function pattern in items.ts (efficient select)
- `getDominantColor()` extracted to `src/lib/db/utils.ts` (shared by collections.ts and sidebar.ts)

## Known Issues / Patterns to Watch
- `getPinnedItems()`, `getRecentItems()`, `getDashboardCollections()`, `getDashboardStats()`, `getSidebarData()`, `getItemsByType()` have NO userId filter — all return data for ALL users
  - This is a CRITICAL multi-tenant data leak once multiple real users exist
- `getItemsByType()` has no `take` limit — can return unbounded rows
- `getPinnedItems()` has no `take` limit — can return unbounded rows
- `createItemInDb` looks up itemType with `findFirst` (no userId filter) — relies on system types having no userId, which is the correct design but fragile if custom types land
- `updateItemById` does a separate existence check query before the update (2 queries instead of checking via the update result)
- `deleteItemById` does a separate existence check query before the delete (same 2-query pattern)
- `Content-Disposition` header in download route uses a double-quoted filename but encodes with `encodeURIComponent` — RFC 6266 requires `filename*=UTF-8''...` for non-ASCII names
- `fileUrl` is returned in the upload API response as a public R2 URL that the client stores verbatim — no server-side validation that the stored fileUrl actually belongs to this user's R2 path
- `formatBytes` is duplicated between `ItemDrawer.tsx` and `FileRow.tsx`
- `formatDate` is duplicated between `ItemCard.tsx`, `FileRow.tsx`, and `ItemDrawer.tsx`
