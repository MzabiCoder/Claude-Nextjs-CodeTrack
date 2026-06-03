# Item CRUD Architecture

A unified system for all 7 item types. Type-specific logic belongs in components — actions and queries are type-agnostic.

---

## File Structure

```
src/
├── actions/
│   └── items.ts                  # create, update, delete, toggleFavorite, togglePin
│
├── lib/db/
│   └── items.ts                  # getItemsByType, getPinnedItems, getRecentItems, getItemById
│
├── app/
│   └── (dashboard)/
│       └── items/
│           └── [type]/
│               ├── page.tsx      # server component — fetches items by type
│               └── loading.tsx   # skeleton
│
└── components/
    └── items/
        ├── ItemList.tsx          # client — list + empty state
        ├── ItemForm.tsx          # client — create/edit drawer, adapts by content type
        ├── ItemCard.tsx          # already exists (src/components/dashboard/ItemCard.tsx)
        └── ItemTypeHeader.tsx    # page header (type name, icon, color, item count, New button)
```

---

## Routing: `/items/[type]`

The `[type]` segment is the URL **slug** (plural, lowercase): `snippets`, `prompts`, `commands`, `notes`, `files`, `images`, `links`.

```
/items/snippets   →  fetches items where itemType.name = "snippet"
/items/prompts    →  fetches items where itemType.name = "prompt"
...
```

**Slug → name mapping** is already defined in `Sidebar.tsx` as `TYPE_SLUGS`. Extract it to `src/lib/constants/item-types.ts` so both the sidebar and the route page share it.

```ts
// src/lib/constants/item-types.ts
export const TYPE_SLUGS: Record<string, string> = {
  snippet: 'snippets',
  prompt: 'prompts',
  command: 'commands',
  note: 'notes',
  file: 'files',
  image: 'images',
  link: 'links',
};

// Reverse map used by the route to resolve slug → type name
export const SLUG_TO_TYPE = Object.fromEntries(
  Object.entries(TYPE_SLUGS).map(([name, slug]) => [slug, name])
);
```

**Page flow:**

```
/items/snippets
  → page.tsx resolves "snippets" → "snippet" via SLUG_TO_TYPE
  → calls getItemsByType(userId, "snippet")
  → renders <ItemTypeHeader> + <ItemList items={...} />
  → 404 if slug doesn't match any known type
```

---

## Mutations: `src/actions/items.ts`

All mutations go through a single server action file. They are **type-agnostic** — the action accepts whatever fields are relevant and Prisma ignores the rest (they remain `null`).

```ts
'use server';

// Shared return type
type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

// Input types (validated with Zod)
createItem(input: CreateItemInput): Promise<ActionResult<Item>>
updateItem(id: string, input: UpdateItemInput): Promise<ActionResult<Item>>
deleteItem(id: string): Promise<ActionResult>
toggleFavorite(id: string, isFavorite: boolean): Promise<ActionResult>
togglePin(id: string, isPinned: boolean): Promise<ActionResult>
```

**CreateItemInput covers all content types:**

```ts
type CreateItemInput = {
  title: string;
  itemTypeId: string;
  contentType: 'TEXT' | 'FILE' | 'URL';
  // TEXT fields
  content?: string;
  language?: string;
  // FILE fields
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  // URL fields
  url?: string;
  description?: string;
  // Shared
  tags?: string[];
};
```

**Auth:** every action calls `auth()` at the top and verifies `session.user.id` owns the item before mutating.

---

## Queries: `src/lib/db/items.ts`

Extend the existing file with:

```ts
// New functions to add
getItemsByType(userId: string, typeName: string, opts?: { limit?: number; offset?: number }): Promise<ItemForCard[]>
getItemById(userId: string, itemId: string): Promise<ItemDetail | null>  // includes full content for edit form
```

`ItemDetail` extends `ItemForCard` with the full `content`, `fileUrl`, `fileName`, `fileSize`, `url` fields needed to pre-fill the edit form.

Queries always filter by `userId` — no item is ever returned without confirming ownership.

---

## Type-Specific Logic: Components Only

Actions and queries are uniform. **The form is where type diverges.**

### `ItemForm.tsx`

A ShadCN Sheet (drawer) used for both create and edit. Receives the resolved `contentType` and shows the relevant fields:

| `contentType` | Fields shown |
|---------------|-------------|
| `TEXT` | `title`, `content` (textarea/editor), `language` (for snippet/command), `tags` |
| `FILE` | `title`, file upload input, `description`, `tags` |
| `URL` | `title`, `url` input, `description`, `tags` |

The form does not need to know the item **type name** — only the `contentType`. This keeps branching minimal.

`language` field is only shown when `itemType.name` is `snippet` or `command` (pass `showLanguage` prop from the parent that resolves this from the type name).

### `ItemCard.tsx` (existing)

Already renders icon + color from `itemType`. Content preview can be added later per type (e.g., truncated `content` for TEXT, filename for FILE, hostname for URL).

### `ItemTypeHeader.tsx`

Displays the page-level type context: icon, colored heading, item count, and the "New [Type]" button that opens `ItemForm` in create mode.

---

## Component Responsibilities Summary

| Component | Server/Client | Responsibility |
|-----------|--------------|----------------|
| `items/[type]/page.tsx` | Server | Auth check, slug resolution, data fetch, layout |
| `ItemTypeHeader.tsx` | Client | Type heading + "New" button trigger |
| `ItemList.tsx` | Client | Renders item cards, empty state, optimistic deletes |
| `ItemCard.tsx` | Server-compatible | Displays one item; receives `ItemForCard` |
| `ItemForm.tsx` | Client | Create/edit Sheet drawer; adapts fields by contentType |

---

## Data Flow

```
User clicks "New Snippet"
  → ItemTypeHeader opens ItemForm (Sheet) in create mode
  → User fills form, submits
  → ItemForm calls createItem() server action
  → Action validates input, inserts to DB, returns { success, data }
  → ItemList receives router.refresh() signal, re-fetches from server
  → Toast shown (sonner)

User clicks edit on an ItemCard
  → ItemList calls getItemById (or passes data from list)
  → ItemForm opens pre-filled in edit mode
  → On submit → updateItem() server action
  → Same refresh flow
```
