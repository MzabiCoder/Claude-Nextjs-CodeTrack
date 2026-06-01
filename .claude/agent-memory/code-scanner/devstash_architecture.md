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
- No API routes implemented yet

## File Organization Conventions
- DB query functions: `src/lib/db/[feature].ts`
- UI components: `src/components/[feature]/ComponentName.tsx`
- Prisma client singleton: `src/lib/prisma.ts`
- Generated Prisma client: `src/generated/prisma/` (gitignored)

## Data Fetching Patterns
- Server components fetch directly via Prisma
- Dashboard page uses Promise.all to parallelize queries
- No userId scoping yet (auth not wired up)
