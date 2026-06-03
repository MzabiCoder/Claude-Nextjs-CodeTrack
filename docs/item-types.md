# Item Types

DevStash has 7 immutable system item types. Each is seeded once with `userId: null` and cannot be modified or deleted by users.

---

## Type Reference

| Type | Icon (Lucide) | Color | Hex | Content Type | Route |
|------|--------------|-------|-----|--------------|-------|
| snippet | `Code` | Blue | `#3b82f6` | TEXT | `/items/snippets` |
| prompt | `Sparkles` | Purple | `#8b5cf6` | TEXT | `/items/prompts` |
| command | `Terminal` | Orange | `#f97316` | TEXT | `/items/commands` |
| note | `StickyNote` | Yellow | `#fde047` | TEXT | `/items/notes` |
| file | `File` | Gray | `#6b7280` | FILE | `/items/files` |
| image | `Image` | Pink | `#ec4899` | FILE | `/items/images` |
| link | `Link` | Emerald | `#10b981` | URL | `/items/links` |

---

## Per-Type Details

### snippet
- **Purpose:** Reusable code fragments — hooks, utilities, patterns, boilerplate
- **Key fields:** `content` (code body), `language` (for syntax highlighting), `tags`
- **Content type:** TEXT

### prompt
- **Purpose:** AI prompts and system messages — code review, documentation generation, refactoring, etc.
- **Key fields:** `content` (prompt body), `tags`
- **Content type:** TEXT

### command
- **Purpose:** Shell commands and one-liners — git shortcuts, Docker cleanup, npm scripts
- **Key fields:** `content` (command string), `tags`
- **Content type:** TEXT

### note
- **Purpose:** Freeform markdown notes — explanations, meeting notes, documentation
- **Key fields:** `content` (markdown body), `tags`
- **Content type:** TEXT

### file
- **Purpose:** Uploaded binary files — PDFs, context files, config examples (Pro only)
- **Key fields:** `fileUrl` (Cloudflare R2 URL), `fileName`, `fileSize`
- **Content type:** FILE

### image
- **Purpose:** Uploaded images — screenshots, diagrams, design references (Pro only)
- **Key fields:** `fileUrl` (Cloudflare R2 URL), `fileName`, `fileSize`
- **Content type:** FILE

### link
- **Purpose:** Saved URLs — documentation, references, tools
- **Key fields:** `url`, `description`
- **Content type:** URL

---

## Content Type Classification

```
TEXT  →  snippet, prompt, command, note   (stores in `content` field)
FILE  →  file, image                      (stores URL in `fileUrl`, metadata in `fileName`/`fileSize`)
URL   →  link                             (stores in `url` field, optional `description`)
```

The `ContentType` enum in `prisma/schema.prisma` enforces this at the database level:

```prisma
enum ContentType {
  TEXT
  FILE
  URL
}
```

---

## Shared Properties

All item types share these fields regardless of content type:

| Field | Type | Notes |
|-------|------|-------|
| `title` | String | Required |
| `description` | String? | Optional freeform description |
| `isFavorite` | Boolean | Default false |
| `isPinned` | Boolean | Default false; pinned items appear at the top of the dashboard |
| `tags` | Tag[] | Many-to-many; shared tag pool across all users |
| `collections` | ItemCollection[] | Many-to-many; items can belong to multiple collections |
| `language` | String? | Programming language hint; used for syntax highlighting (primarily on snippets) |

---

## Display Differences

| Aspect | TEXT types | FILE types | URL type |
|--------|-----------|-----------|---------|
| Content preview | Code/markdown rendered from `content` | File name + size | URL with optional description |
| Syntax highlighting | Yes (snippet, command) / Markdown (note, prompt) | No | No |
| Pro gating | No | Yes | No |
| Icon bg color | `${color}20` (20% opacity tint) | Same | Same |

---

## Implementation Locations

- **Seed data:** `prisma/seed.ts` — upserts all 7 types with `userId: null`
- **Icon map:** `src/components/dashboard/Sidebar.tsx` (`TYPE_ICONS`) and `src/components/dashboard/ItemCard.tsx` (`ICON_MAP`)
- **URL slug map:** `src/components/dashboard/Sidebar.tsx` (`TYPE_SLUGS`)
- **Schema:** `prisma/schema.prisma` — `ItemType` model, `ContentType` enum
