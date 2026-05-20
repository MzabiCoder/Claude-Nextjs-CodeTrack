# Current Feature: Auth Phase 2 — Email/Password Provider

## Status

Complete

## Goals

- Add Credentials provider (email/password) to NextAuth v5
- Create `/api/auth/register` route (name, email, password, confirmPassword)
- Validate passwords match, check for existing user, hash with bcryptjs, create user
- `auth.config.ts`: Credentials provider with `authorize: () => null` placeholder (edge-safe)
- `auth.ts`: Override Credentials provider with real bcrypt validation
- Verify GitHub OAuth still works after changes

## Notes

- bcryptjs is already installed
- Password field already exists on User model (added in auth-phase-1)
- Follow the split-config pattern: edge-safe placeholder in `auth.config.ts`, real logic in `auth.ts`
- Registration route returns `{ success, error }` JSON responses
- Testing: curl registration → sign in via `/api/auth/signin` → verify dashboard redirect

## History

<!-- Keep this updated. Earliest to latest -->

### 2026-05-03 — Initial Next.js + Tailwind Setup
- Initialized Next.js project with TypeScript and Tailwind CSS v4
- Added ESLint, PostCSS, and base project config files
- Set up context documentation files (`project-overview.md`, `coding-standards.md`, `ai-interaction.md`, `current-feature.md`)
- Created initial commit and pushed to GitHub (`MzabiCoder/Claude-Nextjs-CodeTrack`)

### 2026-05-06 — Dashboard UI Phase 1 ✅ Completed
- Initialized ShadCN UI and installed Button and Input components
- Created `/dashboard` route with layout and page
- Built `TopBar` component with logo, centered search input, and New Collection / New Item buttons
- Set dark mode as default via ShadCN `dark` class strategy
- Placeholder sidebar and main area wired into dashboard layout
- Build passes with no errors

### 2026-05-06 — Dashboard UI Phase 2 ✅ Completed
- Built collapsible `Sidebar` component with open/close toggle
- Added item type links to `/items/TYPE` (snippets, prompts, commands, notes, links, files, images)
- Added favorite collections section using mock data
- Added most recent collections section using mock data
- Added user avatar area at the bottom of the sidebar
- Sidebar renders as a sheet/drawer on mobile using ShadCN Sheet component

### 2026-05-06 — Dashboard UI Phase 3 ✅ Completed
- Added 4 stats cards (total items, collections, favorite items, favorite collections)
- Added recent collections grid sorted by most recently updated
- Added pinned items section (conditionally rendered)
- Added 10 most recent items section sorted by creation date
- Refactored layout to a server component; extracted `DashboardShell` as the client boundary for sidebar/mobile state

### 2026-05-11 — Prisma + Neon PostgreSQL Setup ✅ Completed
- Installed Prisma 7 with `@prisma/adapter-neon` driver adapter
- Configured `prisma.config.ts` with schema, migrations, and seed paths
- Created full schema: User, Item, ItemType, Collection, ItemCollection, Tag, and NextAuth models
- Added initial migration and seeded 7 system item types
- Added `src/lib/prisma.ts` singleton client

### 2026-05-11 — Seed Demo Data ✅ Completed
- Overwrote `prisma/seed.ts` with full sample data
- Created demo user (demo@devstash.io) with bcryptjs-hashed password (12 rounds)
- Upserted all 7 system item types
- Created 5 collections with realistic items assigned

### 2026-05-11 — Dashboard Collections ✅ Completed
- Created `src/lib/db/collections.ts` with data fetching functions
- Replaced mock collections data with real Neon DB data via Prisma
- Collection card border color derived from most-used item type in that collection
- Added small type icons displaying all item types present in each collection
- Updated collection stats display on dashboard

### 2026-05-11 — Dashboard Items ✅ Completed
- Created `src/lib/db/items.ts` with `getPinnedItems` and `getRecentItems` functions
- Replaced mock items data with real Neon DB data via Prisma
- Item card icon and border color derived from item type
- Item type displayed as a colored badge alongside tag chips
- Pinned section conditionally hidden when no pinned items exist

### 2026-05-12 — Stats & Sidebar ✅ Completed
- Created `src/lib/db/sidebar.ts` with `getSidebarData()` fetching real item types (with per-type counts) and collections (with dominant color and item count)
- Replaced all mock data in `Sidebar.tsx` with real DB data
- Item types in sidebar now link to `/items/[typename]` with live counts
- Favorite collections show star icon with item count; recent (non-favorite) collections show a colored circle based on dominant item type, also with item count
- Added "View all collections →" link at the bottom of the collections section
- Updated seed to mark React Patterns and AI Workflows as favorites (`isFavorite: true`)

### 2026-05-13 — Pro Badge in Sidebar ✅ Completed
- Installed ShadCN Badge component (`src/components/ui/badge.tsx`)
- Added PRO badge next to "file" and "image" types in `Sidebar.tsx`
- Badge uses `variant="secondary"` for a clean, subtle appearance
- Badge is hidden when sidebar is collapsed (icon-only mode)

### 2026-05-14 — Audit Quick-Wins ✅ Completed
- Added `take: 6` to `getDashboardCollections` and `take: 20` to `getSidebarData`; both switched from `include` to `select` to narrow fetched fields
- Extracted `getDominantColor()` to `src/lib/db/utils.ts`; imported by both `collections.ts` and `sidebar.ts` to remove duplicate reduce/sort logic
- Added Prisma migration `add_query_indexes` with 5 new indexes: `items(isFavorite)`, `items(isPinned)`, `collections(updatedAt)`, `collections(isFavorite, updatedAt)`, `item_collections(collectionId)`
- Added `src/app/dashboard/loading.tsx` skeleton (header, stats cards, collections grid, items list)
- Root `/` now redirects to `/dashboard`
- Fixed app metadata: title `DevStash`, meaningful description
- Replaced `${type.name}s` URL construction with `TYPE_SLUGS` map in `Sidebar.tsx`

### 2026-05-20 — Auth Phase 2: Email/Password Credentials ✅ Completed
- Added Credentials provider to `auth.config.ts` with `authorize: () => null` placeholder (edge-safe)
- Overrode Credentials in `auth.ts` with real bcrypt validation (password lookup, `bcrypt.compare`)
- Created `POST /api/auth/register` route — validates fields, checks for existing email, hashes with bcryptjs (12 rounds), creates user
- Created custom sign-in page at `/sign-in` matching dashboard dark theme (GitHub button + email/password form)
- Wired `pages: { signIn: "/sign-in" }` in `auth.ts` and updated proxy redirect accordingly
- Fixed: silent catch in register route now logs errors; loading state always resets in sign-in form

### 2026-05-19 — Auth Phase 1: NextAuth v5 + GitHub OAuth ✅ Completed
- Installed `next-auth@beta` and `@auth/prisma-adapter`
- Created `src/auth.config.ts` (edge-safe, GitHub provider only) and `src/auth.ts` (PrismaAdapter + JWT strategy + session callback)
- Added `src/app/api/auth/[...nextauth]/route.ts` exporting GET/POST handlers
- Added `src/proxy.ts` protecting `/dashboard/*` — unauthenticated users redirected to `/api/auth/signin`
- Extended `Session` type with `user.id` via `src/types/next-auth.d.ts`
- Added `suppressHydrationWarning` to `<html>`, `<body>`, and `<input>` to silence browser extension attribute injection
