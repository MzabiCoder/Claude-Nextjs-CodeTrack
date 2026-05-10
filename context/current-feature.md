# Current Feature

Prisma + Neon PostgreSQL Setup

## Status

In Progress

## Goals

- Install and configure Prisma 7 ORM
- Connect to Neon PostgreSQL (serverless) via `DATABASE_URL`
- Create initial schema based on data models in `context/project-overview.md`
- Include NextAuth models (Account, Session, VerificationToken)
- Add appropriate indexes and cascade deletes
- Create initial migration (never use `db push`)
- Seed system item types via `prisma/seed.ts`

## Notes

- Spec: `context/features/database-spec.md`
- Use Prisma 7 — read the upgrade guide before implementing (breaking changes from v6)
- Development branch maps to `DATABASE_URL`; production branch is separate
- Always use `prisma migrate dev` for schema changes, never `prisma db push`
- Seed data: 7 system item types (snippet, prompt, command, note, file, image, link)

## Prisma 7 Key Differences from v6

- Generator provider: `prisma-client` (not `prisma-client-js`)
- Output path required in generator block (no longer auto-generated into `node_modules`)
- New `prisma.config.ts` at root replaces env loading and wires schema/migrations/seed
- All databases require a driver adapter — use `@prisma/adapter-neon` + `PrismaNeon` for Neon
- `url` is no longer allowed in the schema's `datasource` block — URL goes in `prisma.config.ts` only
- Generated client entry point is `client.ts` (not `index.ts`) — import from `@/generated/prisma/client`
- Automatic `.env` loading removed — use `import "dotenv/config"` in config and seed files
- Automatic seeding on migrate removed — must run `prisma db seed` explicitly
- `null` not accepted in compound unique `where` clause — use `findFirst` for nullable unique fields
- Requires Node.js 22.12+ or 20.19+

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
