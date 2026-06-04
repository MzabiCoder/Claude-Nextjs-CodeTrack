# Current Feature

## Status

Not Started

## Goals

<!-- Add feature goals here -->

## Notes

<!-- Add feature notes here -->

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
- Created `src/lib/db/sidebar.ts` with `getSidebarData()` fetchinDevStashg real item types (with per-type counts) and collections (with dominant color and item count)
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

### 2026-05-19 — Auth Phase 1: NextAuth v5 + GitHub OAuth ✅ Completed
- Installed `next-auth@beta` and `@auth/prisma-adapter`
- Created `src/auth.config.ts` (edge-safe, GitHub provider only) and `src/auth.ts` (PrismaAdapter + JWT strategy + session callback)
- Added `src/app/api/auth/[...nextauth]/route.ts` exporting GET/POST handlers
- Added `src/proxy.ts` protecting `/dashboard/*` — unauthenticated users redirected to `/api/auth/signin`
- Extended `Session` type with `user.id` via `src/types/next-auth.d.ts`
- Added `suppressHydrationWarning` to `<html>`, `<body>`, and `<input>` to silence browser extension attribute injection

### 2026-05-29 — Email Verification Toggle ✅ Completed
- Added `src/lib/flags.ts` as single source of truth for `EMAIL_VERIFICATION_ENABLED` (defaults `true`; set env var to `"false"` to bypass)
- Register route branches on flag: disabled path sets `emailVerified: new Date()` immediately and returns `skipVerification: true`, skipping token creation and Resend email
- `RegisterForm.tsx` reads `skipVerification` from response — redirects to `/sign-in?registered=1` when bypassed, `/verify-email` when enforced
- Set `EMAIL_VERIFICATION_ENABLED=false` in `.env` while sending domain is not yet configured
- Fixed pre-existing duplicate `not` key bug in `scripts/reset-users.ts` itemType query

### 2026-05-29 — Auth Phase 4: Email Verification on Register ✅ Completed
- Installed Resend; added `src/lib/resend.ts` singleton (reads `RESENT_API_KEY`)
- Register route generates UUID token, stores in `VerificationToken` (24h expiry), sends verification email via `onboarding@resend.dev`
- Added `GET /api/auth/verify-email`: validates token expiry, sets `emailVerified` on user, deletes token, redirects to `/sign-in?verified=true` (or error states for invalid/expired tokens)
- `auth.ts` blocks unverified Credentials users via custom `UnverifiedEmail extends CredentialsSignin` error (code: `"unverified"`); GitHub OAuth unaffected
- Added `/verify-email` "check your inbox" page shown immediately after registration
- Sign-in page handles `?verified=true` (success banner), `?error=unverified`, `?error=InvalidToken`, `?error=ExpiredToken`
- Added `scripts/reset-users.ts` to wipe all users and content except `demo@devstash.io` (dry-run by default, `--execute` to apply)

### 2026-05-29 — Forgot Password ✅ Completed
- Added "Forgot password?" link inline with the Password label on the sign-in page
- Built `/forgot-password` page with email form (`ForgotPasswordForm.tsx`) — shows "check your inbox" state on submit, and a GitHub account message for OAuth-only users
- Created `POST /api/auth/forgot-password`: looks up user, deletes any existing reset token, creates a new `VerificationToken` with `identifier = "reset:{email}"` and 1-hour expiry, sends reset link via Resend
- Built `/reset-password?token=...` page — redirects to `/forgot-password` if no token in URL
- Created `POST /api/auth/reset-password`: validates token has `"reset:"` prefix and is not expired, hashes new password with bcrypt (12 rounds), updates user, deletes token
- Sign-in page handles `?reset=true` with a green success banner
- No new Prisma models — reused `VerificationToken` with identifier prefix to distinguish from email-verification tokens

### 2026-06-01 — Profile Page ✅ Completed
- Created `/profile` route protected by middleware (`src/proxy.ts`)
- Server component fetches user info and usage stats directly via Prisma (`src/lib/db/profile.ts`)
- Displays avatar (GitHub image or initials fallback), name, email, and account creation date
- Shows usage stats: total items and collections, plus per-type item count breakdown
- Added `ChangePasswordForm.tsx` (shown only for Credentials users with `user.password` set); POSTs to `POST /api/user/change-password`
- Added `DeleteAccountDialog.tsx` using ShadCN AlertDialog for confirmation; POSTs to `DELETE /api/user` — cascades delete via Prisma then signs out and redirects to `/`
- Installed ShadCN AlertDialog component (`src/components/ui/alert-dialog.tsx`)

### 2026-06-03 — Item Drawer ✅ Completed
- Added right-side Sheet drawer that opens on `ItemCard` click via `ItemDrawerContext`
- `ItemDrawerContext` provides `openDrawer(id)` to all cards through `DashboardShell` — no page file changes needed
- Created `GET /api/items/[id]`: auth-checked via `auth()`, returns 401/404 or full item JSON scoped to authenticated user
- Added `getItemById(userId, id)` to `src/lib/db/items.ts` — fetches content, url, collections, language, dates
- Drawer: header with icon + title + type/language chips, action bar (Favorite/Pin/Copy/Edit/Delete), body sections (description, content, url, tags, collections, details)
- Skeleton loading state while fetch is in flight
- 10 unit tests covering `getItemById` mapping logic and API route auth/authorization paths

### 2026-06-03 — Item List View 3-Column Layout ✅ Completed
- Updated `/items/[type]` grid from `md:grid-cols-2` to `md:grid-cols-2 lg:grid-cols-3`
- Responsive: 1 col on mobile, 2 on md, 3 on lg+

### 2026-06-03 — Items List View ✅ Completed
- Created dynamic route `src/app/items/[type]/page.tsx` — server component, handles all 7 type slugs, returns 404 for unknown types
- Added `src/app/items/layout.tsx` wrapping children in `DashboardShell` (same pattern as dashboard layout)
- Added `getItemsByType(typeSlug)` to `src/lib/db/items.ts` with a `SLUG_TO_TYPE` reverse map
- Two-column responsive grid (`grid-cols-1 md:grid-cols-2`) using existing `ItemCard` component
- Protected `/items` routes in `src/proxy.ts` alongside `/dashboard` and `/profile`

### 2026-06-01 — Rate Limiting for Auth ✅ Completed
- Created `src/lib/rate-limit.ts` with Upstash Redis sliding window limiters, IP extraction, fail-open error handling, and `rateLimitResponse()` helper
- Rate limited `POST /api/auth/register` (3 attempts / 1 hour / by IP)
- Rate limited `POST /api/auth/forgot-password` (3 attempts / 1 hour / by IP)
- Rate limited `POST /api/auth/reset-password` (5 attempts / 15 min / by IP)
- Added login rate limiting inside NextAuth `authorize()` (5 attempts / 15 min / IP + email) via `RateLimited extends CredentialsSignin` error class
- `SignInForm.tsx` maps `rate_limited` error code to user-friendly message
- All routes return 429 with `{ error: "Too many attempts..." }` and `Retry-After` header; fail open if Upstash is unavailable

### 2026-06-03 — Item Drawer Edit Mode ✅ Completed
- Edit button in the drawer action bar switches to inline edit mode
- Action bar replaced with Save (green) and Cancel buttons in edit mode; Save disabled when title is empty
- Editable fields: title (input), description (textarea), tags (comma-separated input)
- Type-specific fields: content textarea for snippet/prompt/command/note; language input for snippet/command; URL input for link
- Non-editable in edit mode: item type chip, collections, created/updated dates
- Cancel discards changes and returns to view mode; Save calls `updateItem` server action, re-fetches drawer data, shows toast, and triggers `router.refresh()`
- Created `src/actions/items.ts` with `updateItem(itemId, data)` — Zod v4 schema validates all fields, `auth()` session check, `{ success, data, error }` return pattern
- Added `updateItemById(userId, id, data)` to `src/lib/db/items.ts` — ownership check, tag disconnect-all + connect-or-create, returns updated `ItemDetail`
- Installed `zod` as an explicit dependency (was previously transitive only)

### 2026-06-03 — Item Create ✅ Completed
- Installed ShadCN Dialog component (`src/components/ui/dialog.tsx`)
- Created `NewItemDialog.tsx` — type selector (snippet/prompt/command/note/link), dynamic fields per type, toast on success, closes and refreshes on create
- Added `createItemInDb(userId, data)` to `src/lib/db/items.ts` — looks up itemType by name, maps to `ContentType` enum, creates item with tag `connectOrCreate`
- Added `createItem(data)` server action to `src/actions/items.ts` — Zod v4 validation, auth check, link URL required guard, `{ success }` or `{ success: false, error }` return
- Wired "New Item" button in `TopBar` → `newItemOpen` state in `DashboardShell` → `NewItemDialog`
- 12 new unit tests (6 for `createItem`, 5 for `createItemInDb`, 1 for `deleteItemById`); 32 total passing

### 2026-06-03 — Item Delete ✅ Completed
- Delete button in the drawer action bar (view mode only) opens a ShadCN AlertDialog showing the item title
- Cancel dismisses; Delete calls `deleteItem` server action → closes drawer → success toast → `router.refresh()`
- Error case shows toast and leaves dialog closed
- Added `deleteItemById(userId, id)` to `src/lib/db/items.ts` — ownership check then `prisma.item.delete`; returns `boolean`
- Added `deleteItem(itemId)` to `src/actions/items.ts` — `auth()` session check, ownership validation, `{ success }` or `{ success: false, error }` return
- Created `src/actions/items.test.ts` with 5 tests for `deleteItem`; extended `src/lib/db/items.test.ts` with 5 tests for `deleteItemById` (20 total passing)

### 2026-06-04 — Code Editor ✅ Completed
- Created `src/components/shared/CodeEditor.tsx` using `@monaco-editor/react` with `vs-dark` theme
- macOS-style window dots (red/yellow/green) and copy button with `Copied` feedback in editor header
- Language label displayed in header when set; fluid height auto-resizes from 120px up to 400px max
- Custom Monaco scrollbar (6px) styled to match dark theme; line numbers, word wrap, no minimap
- Replaced content `Textarea` with `CodeEditor` in `ItemDrawer` (view + edit modes) and `NewItemDialog` for snippet/command types
- All other types (prompt, note, link) continue to use plain `Textarea`

### 2026-06-04 — Markdown Editor ✅ Completed
- Installed `react-markdown` and `remark-gfm` for GitHub Flavored Markdown rendering
- Created `src/components/shared/MarkdownEditor.tsx` with Write/Preview tab interface, macOS-style header dots, and copy button — matching `CodeEditor` styling
- Readonly mode shows Preview tab only; edit mode defaults to Write tab with Preview available
- Added `.markdown-preview` CSS class to `globals.css` for h1–h6 sizing, code blocks, inline code, lists, blockquotes, links, and tables
- Replaced plain `textarea` with `MarkdownEditor` for note and prompt content in `ItemDrawer` (view + edit modes) and `NewItemDialog`
- Added `key="markdown-edit"` / `key="markdown-view"` to prevent React from reusing component state across view/edit mode transitions
- `CodeEditor` for snippet/command types and link handling unchanged
