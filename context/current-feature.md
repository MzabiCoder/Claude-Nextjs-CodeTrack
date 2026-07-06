# Current Feature

## Status

Not Started

## Goals

<!-- Add feature goals here -->

## Notes

<!-- Add notes here -->

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

### 2026-06-01 — Rate Limiting for Auth ✅ Completed
- Created `src/lib/rate-limit.ts` with Upstash Redis sliding window limiters, IP extraction, fail-open error handling, and `rateLimitResponse()` helper
- Rate limited `POST /api/auth/register` (3 attempts / 1 hour / by IP)
- Rate limited `POST /api/auth/forgot-password` (3 attempts / 1 hour / by IP)
- Rate limited `POST /api/auth/reset-password` (5 attempts / 15 min / by IP)
- Added login rate limiting inside NextAuth `authorize()` (5 attempts / 15 min / IP + email) via `RateLimited extends CredentialsSignin` error class
- `SignInForm.tsx` maps `rate_limited` error code to user-friendly message
- All routes return 429 with `{ error: "Too many attempts..." }` and `Retry-After` header; fail open if Upstash is unavailable

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

### 2026-06-04 — Image Gallery View ✅ Completed
- Created `src/components/dashboard/ImageCard.tsx`: 16:9 `aspect-video` thumbnail with `object-cover`, 5% hover zoom (300ms transition), info section below image separated by `border-t border-border`
- `/items/images` now renders a 3-column `ImageCard` gallery grid; all other type pages continue using `ItemCard`
- Added `fileUrl` to `ItemForCard` type, `itemSelect`, and `mapItem` so card thumbnails have access to the R2 URL

### 2026-06-04 — File & Image Upload with Cloudflare R2 ✅ Completed
- Installed `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`; created `src/lib/r2.ts` with S3Client singleton, `putObject`, `deleteObject`, `getPublicUrl`, `keyFromPublicUrl` helpers
- Created `POST /api/upload`: receives multipart/form-data, validates MIME type and file size (images ≤5 MB, files ≤10 MB), uploads buffer to R2 via `PutObjectCommand`, returns `{ fileUrl, fileName, fileSize, key }`
- Created `GET /api/download/[id]`: ownership-checked proxy — fetches from R2 public URL and streams back with `Content-Disposition: attachment` for forced downloads
- Created `src/components/shared/FileUpload.tsx`: drag-and-drop zone, XHR upload with real percentage progress bar, image preview thumbnail on success, file info card with clear button
- Updated `NewItemDialog`: added `file` and `image` to the type selector; those types render `FileUpload` instead of text fields; Create button disabled until upload completes
- Updated `ItemDrawer`: `image` type renders inline image preview; `file` type shows name/size info card with Download button; Download action link added to action bar for both types
- `deleteItem` server action now fetches `fileUrl` before DB deletion and calls `deleteObject` to clean up R2 on item delete
- `ItemDetail`, `CreateItemData` types extended with `fileUrl`, `fileName`, `fileSize`; `TYPE_TO_CONTENT_TYPE` map includes `file` and `image` → `ContentType.FILE`
- Updated `next.config.ts` to add R2 public URL hostname to `images.remotePatterns`
- Tests updated: mocked `getItemFileUrl` and `@/lib/r2` in `items.test.ts`; all 32 tests passing

### 2026-06-04 — File List View ✅ Completed
- Created `src/components/dashboard/FileRow.tsx`: single-column list row with file icon (varies by extension: pdf/txt/md/csv → FileText, json/yaml/toml/xml → FileCode, fallback → File), file name, size, upload date, and a download button
- Download button uses `<a href="/api/download/[id]" download>` with `e.stopPropagation()` — triggers direct download without opening the drawer
- Row click calls `openDrawer(item.id)` via `useItemDrawer`; hover highlight via `hover:bg-accent/50`
- Responsive: size and date shown as right-aligned columns on desktop (`sm:`); stacked below name as a single line on mobile
- `/items/files` renders a bordered list with `divide-y` separators using `FileRow`; all other type pages unaffected
- Added `fileName` and `fileSize` to `ItemForCard`, `itemSelect`, and `mapItem` in `src/lib/db/items.ts`

### 2026-06-08 — Code Audit Quick Wins ✅ Completed
- Added `take: 20` to `getPinnedItems` and `take: 100` to `getItemsByType` in `src/lib/db/items.ts` to cap unbounded queries
- Fixed `Content-Disposition` header in `GET /api/download/[id]` — ASCII filenames use `filename="..."`, non-ASCII use RFC 6266 `filename*=UTF-8''...` format
- Removed unused `resendVerification` rate limiter from `src/lib/rate-limit.ts`
- Extracted `formatBytes`, `formatDate`, `formatDateLong`, `formatDateCompact` into `src/lib/format.ts`; removed 3 duplicate implementations from `ItemDrawer.tsx`, `FileRow.tsx`, and `ItemCard.tsx`

### 2026-06-08 — Code Decomposition ✅ Completed
- Fixed `formatBytes` duplicate in `FileUpload.tsx` — now imports from `@/lib/format`
- Broke `ItemDrawer.tsx` into `DrawerActionBar`, `DrawerViewBody`, `DrawerEditBody` sub-components (same file, separate functions)
- Split `src/lib/db/items.ts` into `items-queries.ts` + `items-mutations.ts`; `items.ts` is now a 5-line re-export barrel
- Extracted `SidebarCollections` component from `Sidebar.tsx`

### 2026-06-08 — Collection Create ✅ Completed
- Created `POST /api/collections`: auth-checked, user-scoped, validates name, returns 201 with created collection JSON
- Created `NewCollectionDialog.tsx`: name (required) + description (optional) fields, toast on success/failure, closes and refreshes on create
- Wired `onNewCollectionClick` prop through `TopBar` → `DashboardShell` state → `NewCollectionDialog`
- Installed ShadCN Textarea component
- 9 unit tests for the API route (auth, validation, user scoping, trimming, response shape); 41 total passing

### 2026-06-08 — Item Collection Assignment ✅ Completed
- Added `GET /api/collections`: returns authenticated user's collections as `[{ id, name }]`
- Created `CollectionPicker` shared component: Popover with scrollable checkbox list, fetches on mount
- `NewItemDialog`: CollectionPicker added below Tags; `collectionIds` passed to `createItem` action
- `ItemDrawer` edit mode: CollectionPicker replaces static badge list; pre-populated from `item.collections`; `collectionIds` passed to `updateItem` action
- `createItem` action + `createItemInDb`: accept `collectionIds`, connect via nested create on `ItemCollection`
- `updateItem` action + `updateItemById`: accept `collectionIds`, sync via `$transaction` (deleteMany + createMany)
- Installed ShadCN Popover component
- 11 new unit tests (GET /api/collections ×4, updateItem action ×7); 52 total passing

### 2026-06-08 — Collections Pages ✅ Completed
- Created `/collections` page listing all user collections as a `CollectionCard` grid
- Created `/collections/[id]` page showing collection items grouped by type with labeled section headers
- Items rendered with the correct component per type: `ItemCard` for text types, `ImageCard` for images, `FileRow` for files
- Collection cards on dashboard and sidebar "View all collections →" link to the new pages
- DevStash logo in `TopBar` made clickable, links to `/dashboard`
- Back arrow added to `/items/[type]` (→ dashboard) and `/collections/[id]` (→ collections)
- Protected `/collections` and `/collections/[id]` routes in `src/proxy.ts`
- 11 unit tests for `getAllCollections` and `getCollectionById` (63 total passing)

### 2026-06-09 — Collection Management Actions ✅ Completed
- Added `PATCH /api/collections/[id]` (edit name/description) and `DELETE /api/collections/[id]` (delete collection; cascades to ItemCollection, never touches Item records)
- Added `DELETE /api/collections/[id]/items/[itemId]` to remove an item from a collection without deleting the item globally
- `CollectionActions` component: Favorite icon button (UI-only), Edit button → `EditCollectionDialog`, Delete button → AlertDialog confirm; used in `/collections/[id]` page header
- `EditCollectionDialog`: name + description modal, same pattern as `NewCollectionDialog`
- `CollectionCard` restructured: card body is a `<NextLink>`, 3-dots `DropdownMenu` absolutely positioned at bottom-right with Edit / Favorite / Delete; fixed `onSelect` → `onClick` for base-ui compatibility
- `CollectionItemCard`: collection-scoped item card (no drawer); 3-dots dropdown with Favorite toggle (live), Edit → `EditItemDialog`, Remove from Collection → AlertDialog confirm
- `EditItemDialog`: lightweight edit dialog for title, description, and tags in collection context
- `updateItemBasic` + `toggleFavoriteItem` server actions; `updateItemBasicById` db helper added to `items-mutations.ts`

### 2026-06-09 — Global Search / Command Palette ✅ Completed
- Added `CommandPalette.tsx` using ShadCN `cmdk` with grouped results (Items and Collections sections)
- Opens with Cmd+K (Mac) / Ctrl+K (Windows); TopBar search input also opens palette on click
- Client-side fuzzy search over pre-fetched data — no API call per keystroke
- Item results show colored type icon and 80-char content preview; collection results show item count
- Selecting an item calls `openDrawer(id)` from `ItemDrawerContext`; selecting a collection navigates to `/collections/[id]`
- Added `getSearchData(userId)` in `src/lib/db/search.ts` for lightweight search data prefetch
- Added `src/lib/db/users.ts` with `getUserById` helper
- `DashboardShell` and all layout wrappers (dashboard, items, collections) pass search data down to `CommandPalette`
- 8 unit tests for `getSearchData`; 71 total passing

### 2026-06-09 — Pagination ✅ Completed
- Created `src/lib/constants.ts` with `ITEMS_PER_PAGE = 21`, `COLLECTIONS_PER_PAGE = 21`, `DASHBOARD_COLLECTIONS_LIMIT = 6`, `DASHBOARD_RECENT_ITEMS_LIMIT = 10`
- Paginated `getItemsByType` (skip/take + parallel count query) using `ITEMS_PER_PAGE`
- Paginated `getAllCollections` (skip/take + parallel count query) using `COLLECTIONS_PER_PAGE`
- Paginated `getCollectionById` items (skip/take); `itemCount` sourced from `_count.items` for accurate total regardless of page
- `getDashboardCollections` and `getRecentItems` now use named constants instead of magic numbers
- Created `src/components/shared/Pagination.tsx` — numbered pages with ellipsis, prev/next buttons greyed out at boundaries, uses Next.js `Link`
- `/items/[type]`, `/collections`, and `/collections/[id]` pages read `?page` search param and render `Pagination` at the bottom
- Updated collections tests for new `{ collections, totalCount }` / `_count` return shapes; 72 total passing

### 2026-06-11 — Settings Page ✅ Completed
- Created `/settings` page (server component) protected in `src/proxy.ts`
- Added `getUserForSettings(id)` to `src/lib/db/users.ts` — returns `UserForSettings` with `hasPassword: boolean` (no raw hash exposed)
- Settings page shows `ChangePasswordForm` conditionally (credentials users only) and `DeleteAccountDialog`
- `ChangePasswordForm` and `DeleteAccountDialog` remain in `src/app/profile/` and are imported by settings page via `@/app/profile/...`
- Profile page simplified: retains avatar, name, email, joined date, and usage stats; account action sections removed
- Sidebar user dropdown gains "Settings" link (between Profile and Sign out) using `Settings` icon from lucide-react

### 2026-06-12 — Favorite Toggle ✅ Completed
- Created `src/actions/collections.ts` with `toggleFavoriteCollection` server action (auth-checked, ownership-scoped, mirrors `toggleFavoriteItem`)
- Wired `DrawerActionBar` Favorite button in `ItemDrawer.tsx` — `handleFavorite` applies optimistic `setItem` update, reverts with toast on error
- Wired `CollectionActions.tsx` Favorite star button — local `isFavorite` state, optimistic flip, revert on failure
- Wired `CollectionCard.tsx` dropdown "Favorite" item — same optimistic pattern; label toggles between "Favorite" and "Unfavorite"; filled star shown in card header when active
- No page refresh on any surface — all updates are purely client-side optimistic

### 2026-06-12 — Pinned Items ✅ Completed
- Added `toggleItemPin` server action to `src/actions/items.ts` — auth-checked, ownership-scoped, mirrors `toggleFavoriteItem`
- Wired the Pin button in `DrawerActionBar` (`ItemDrawer.tsx`) — previously rendered but had no `onClick`
- Optimistic `setItem` flip on click, reverts on error with `toast.error`; `router.refresh()` on success to sync the dashboard Pinned Items section
- Pin button turns blue (`text-blue-400 / fill-blue-400`) when active, matches the filled-star pattern used by Favorite
- Items only — no collection pin concept; `ItemCard` pin icon remains a static display indicator

### 2026-06-12 — Favorites Page Sorting ✅ Completed
- Added independent sort dropdowns to both the Items and Collections sections of `FavoritesList.tsx`
- Items sort options: Date newest, Date oldest, Name A→Z, Name Z→A, Type (alphabetical by type name)
- Collections sort options: Date newest, Date oldest, Name A→Z, Name Z→A
- Sorting is fully client-side using `useState` + `useMemo` — no extra API calls or URL changes
- Used ShadCN `Select` component styled with `h-7 w-40 text-xs font-mono` to match the terminal aesthetic
- Default sort for both sections is "Date: newest" (matching original server-side order)

### 2026-06-12 — Favorites Page ✅ Completed
- Created `src/lib/db/favorites.ts` with `getFavorites(userId)` — parallel queries for favorited items and collections, sorted by `updatedAt` desc
- Created `/favorites` route (layout + page) following the same `DashboardShell` pattern as items and collections
- Protected `/favorites` in `src/proxy.ts`
- Built `src/components/favorites/FavoritesList.tsx`: compact terminal-style list with `font-mono`, two sections (Items, Collections) each with count headers, type icon + title + type badge + date per row
- Item rows call `openDrawer(id)` via `ItemDrawerContext`; collection rows navigate to `/collections/[id]`
- Empty state shown when neither section has data
- Added Star icon button to TopBar linking to `/favorites`

### 2026-07-03 — Homepage Mockup ✅ Completed
- Created static marketing prototype at `prototypes/homepage/` (`index.html`, `styles.css`, `script.js`)
- Fixed top nav with logo, Features/Pricing links, Sign In/Get Started buttons; goes opaque with blur on scroll
- Hero: "chaos to order" visual — 8 floating emoji icons bounce off walls and repel from mouse cursor (requestAnimationFrame) → pulsing arrow → dashboard preview mockup with top bar (search + avatar), sidebar nav items, and 4 rows of 2 colored item cards with fake title/description lines
- Features section: 6 cards with per-type accent colors and PRO badge on Files & Docs
- AI Pro section: two-column layout with feature checklist and syntax-highlighted TypeScript code editor mockup with amber "AI Generated Tags" demo
- Pricing section: Monthly/Yearly toggle ($8/mo ↔ $72/yr, "save 25%"), Free vs Pro cards, Pro highlighted as "Most Popular"
- CTA section and footer with Product/Account/Legal link columns and auto-updated copyright year
- Scroll-triggered fade-in via IntersectionObserver; responsive (stacks vertically on mobile, arrow rotates 90°)

### 2026-07-06 — Homepage ✅ Completed
- Replaced redirect-only `src/app/page.tsx` with full marketing homepage; authenticated users redirect to `/dashboard`, guests see marketing page
- `MarketingNav` (client) — fixed nav, transparent → opaque/blurred on scroll, mobile hamburger menu
- `HeroChaos` (client) — chaos icon animation (drift + bounce + mouse repel via RAF) + pulsing arrow + dashboard mockup skeleton
- `HeroText` (server) — gradient headline, subheadline, CTA buttons linking to `/sign-in` and `/register`
- `FeaturesSection` (server) — 6 feature cards with per-type accent colors, PRO badge on Files & Images
- `AiSection` (server) — 2-col layout: Pro checklist left, `<pre><code>` editor mockup right with AI tags
- `PricingSection` (client) — monthly/yearly toggle, Free + Pro cards with dynamic price ($8/mo or $72/yr)
- `CtaSection` (server) — centered headline + Get Started button
- `MarketingFooter` (server) — logo, link columns, server-rendered copyright year
- `FadeIn` (client) — `IntersectionObserver` wrapper for scroll-triggered fade-in on all sections
- All components in `src/components/marketing/`; Tailwind-only styling
