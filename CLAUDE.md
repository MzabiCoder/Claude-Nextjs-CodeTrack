# DevSTash

A developer knowledge hub for snippets, commands, prompts, notes, files, images, links and custom types.

## Context Files 

Read the following to get the full contextof of the project:

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md
 
## Neon MCP Rules

**ALWAYS** use these defaults for every Neon MCP tool call:

| Setting | Value |
|---|---|
| Project | **Codecenter** (`wild-dew-50108356`) |
| Branch | **Devolement** (`br-green-mountain-apnpzhgx`) |

**NEVER** target the `production` branch (`br-green-resonance-apn39bgv`) unless the user explicitly says "production" or "prod" in their message.

If a Neon tool call does not require a `branchId`, still default to Devolement mentally — never infer production.

---

## Commands

```bash
npm run dev         # start dev server (Next.js on port 3000)
npm run build       # production build
npm run start       # serve production build
npm run lint        # run ESLint
npm run test        # run unit tests (single run)
npm run test:watch  # run unit tests in watch mode
```
 
