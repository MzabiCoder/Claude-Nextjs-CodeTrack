# 🗃️ DevStash — Project Overview

> **One fast, searchable, AI-enhanced hub for all your dev knowledge & resources.**

---

## 📌 The Problem

Developers keep their essentials scattered across too many places:

| Resource | Where it lives |
|----------|---------------|
| Code snippets | VS Code, Notion |
| AI prompts | Chat histories |
| Context files | Buried in projects |
| Useful links | Browser bookmarks |
| Docs | Random folders |
| Commands | `.txt` files, bash history |
| Templates | GitHub Gists |

This creates **context switching**, **lost knowledge**, and **inconsistent workflows**. DevStash fixes this.

---

## 👤 Target Users

| User Type | Primary Need |
|-----------|-------------|
| **Everyday Developer** | Fast access to snippets, prompts, commands, links |
| **AI-first Developer** | Save prompts, contexts, workflows, system messages |
| **Content Creator / Educator** | Store code blocks, explanations, course notes |
| **Full-stack Builder** | Collect patterns, boilerplates, API examples |

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) / React 19 |
| **Language** | TypeScript |
| **Database** | [Neon](https://neon.tech/) (PostgreSQL) |
| **ORM** | [Prisma 7](https://www.prisma.io/docs) (latest) |
| **Auth** | [NextAuth v5](https://authjs.dev/) — Email/password + GitHub OAuth |
| **File Storage** | [Cloudflare R2](https://developers.cloudflare.com/r2/) |
| **AI** | OpenAI `gpt-4o-mini` |
| **CSS** | [Tailwind CSS v4](https://tailwindcss.com/) + [ShadCN UI](https://ui.shadcn.com/) |
| **Caching** | Redis (optional) |

> ⚠️ **Migration rule:** Never use `db push` or directly update DB structure. Always create migrations to run in dev then prod.

---

## 🎨 Item Types

Items are the core building block of DevStash. Each type has a color and icon for visual identification.

| Type | Color | Hex | Icon | URL Pattern | Pro Only |
|------|-------|-----|------|-------------|----------|
| Snippet | 🔵 Blue | `#3b82f6` | `<Code />` | `/items/snippets` | No |
| Prompt | 🟣 Purple | `#8b5cf6` | `<Sparkles />` | `/items/prompts` | No |
| Command | 🟠 Orange | `#f97316` | `<Terminal />` | `/items/commands` | No |
| Note | 🟡 Yellow | `#fde047` | `<StickyNote />` | `/items/notes` | No |
| Link | 🟢 Emerald | `#10b981` | `<Link />` | `/items/links` | No |
| File | ⚫ Gray | `#6b7280` | `<File />` | `/items/files` | ✅ Yes |
| Image | 🩷 Pink | `#ec4899` | `<Image />` | `/items/images` | ✅ Yes |

**Content type mapping:**
- `text` → snippet, prompt, command, note
- `url` → link
- `file` → file, image

> Users can create **custom types** later (Pro feature, coming soon). System types cannot be modified.

---

## ✨ Features

### A. Items
- Create/edit/delete items of any type
- Quick access via a **slide-in drawer**
- Pin items to top
- Mark as favorite
- Recently used tracking
- Import code from a file
- Markdown editor for text types
- File upload for file/image types
- View which collections an item belongs to
- Add/remove from multiple collections

### B. Collections
- Group items of any type
- Items can belong to multiple collections
- Favorite collections
- Default type per collection

**Example collections:**
- `React Patterns` → snippets, notes
- `Context Files` → files
- `Python Snippets` → snippets
- `Interview Prep` → snippets, notes, commands

### C. Search
Powerful search across:
- **Content**
- **Tags**
- **Titles**
- **Types**

### D. Authentication
- Email/password
- GitHub OAuth (via NextAuth v5)

### E. Other
- Dark mode (default)
- Light mode toggle
- Export data (JSON / ZIP) — Pro
- Toast notifications
- Loading skeletons

### F. AI Features (Pro only)
| Feature | Description |
|---------|-------------|
| Auto-tag suggestions | AI suggests relevant tags on save |
| AI Summaries | Summarize long snippets/notes |
| Explain This Code | Line-by-line code explanation |
| Prompt Optimizer | Improve AI prompts for better results |

---

## 💰 Monetization

Freemium model with Stripe integration.

| Feature | Free | Pro ($8/mo or $72/yr) |
|---------|------|----------------------|
| Items | 50 total | Unlimited |
| Collections | 3 | Unlimited |
| File & Image uploads | ❌ | ✅ |
| Custom types | ❌ | ✅ (coming later) |
| AI features | ❌ | ✅ |
| Export (JSON/ZIP) | ❌ | ✅ |
| Priority support | ❌ | ✅ |
| System types (no file/image) | ✅ | ✅ |
| Basic search | ✅ | ✅ |

> 🛠️ **Dev note:** During development, all users can access Pro features. The foundation for Pro gating should be set up early.

---

## 🗄️ Prisma Schema

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                   String    @id @default(cuid())
  name                 String?
  email                String    @unique
  emailVerified        DateTime?
  image                String?
  password             String?
  isPro                Boolean   @default(false)
  stripeCustomerId     String?   @unique
  stripeSubscriptionId String?   @unique
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  accounts    Account[]
  sessions    Session[]
  items       Item[]
  collections Collection[]
  itemTypes   ItemType[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model ItemType {
  id       String  @id @default(cuid())
  name     String
  icon     String
  color    String
  isSystem Boolean @default(false)
  userId   String? // null for system types

  user  User?  @relation(fields: [userId], references: [id], onDelete: Cascade)
  items Item[]

  @@unique([name, userId])
}

model Item {
  id          String      @id @default(cuid())
  title       String
  contentType ContentType // text | file
  content     String?     @db.Text // text content or null if file
  fileUrl     String?     // R2 URL or null if text
  fileName    String?     // original filename
  fileSize    Int?        // bytes
  url         String?     // for link types
  description String?     @db.Text
  isFavorite  Boolean     @default(false)
  isPinned    Boolean     @default(false)
  language    String?     // for code snippets
  lastUsedAt  DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  userId     String
  itemTypeId String

  user        User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  itemType    ItemType         @relation(fields: [itemTypeId], references: [id])
  tags        TagsOnItems[]
  collections ItemCollection[]
}

model Collection {
  id            String   @id @default(cuid())
  name          String
  description   String?  @db.Text
  isFavorite    Boolean  @default(false)
  defaultTypeId String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  userId String

  user  User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  items ItemCollection[]
}

model ItemCollection {
  itemId       String
  collectionId String
  addedAt      DateTime @default(now())

  item       Item       @relation(fields: [itemId], references: [id], onDelete: Cascade)
  collection Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)

  @@id([itemId, collectionId])
}

model Tag {
  id    String        @id @default(cuid())
  name  String        @unique
  items TagsOnItems[]
}

model TagsOnItems {
  itemId String
  tagId  String

  item Item @relation(fields: [itemId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([itemId, tagId])
}

enum ContentType {
  text
  file
  url
}
```

---

## 🗂️ Project Structure (Suggested)

```
devstash/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Sidebar + main layout
│   │   ├── page.tsx            # Home / recent items
│   │   ├── items/
│   │   │   ├── [type]/         # /items/snippets, /items/prompts etc.
│   │   └── collections/
│   │       └── [id]/
│   └── api/
│       ├── items/
│       ├── collections/
│       ├── upload/             # R2 file uploads
│       └── ai/                 # AI endpoints (tag, explain, summarize)
├── components/
│   ├── ui/                     # ShadCN components
│   ├── items/
│   │   ├── ItemCard.tsx
│   │   ├── ItemDrawer.tsx
│   │   └── ItemForm.tsx
│   ├── collections/
│   │   └── CollectionCard.tsx
│   └── sidebar/
│       └── Sidebar.tsx
├── lib/
│   ├── prisma.ts
│   ├── auth.ts                 # NextAuth config
│   ├── r2.ts                   # Cloudflare R2 client
│   └── openai.ts               # OpenAI client
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── types/
    └── index.ts
```

---

## 🖥️ UI/UX Guidelines

### Layout
- **Sidebar** (collapsible) → becomes a drawer on mobile
  - Item type links (Snippets, Prompts, Commands, etc.)
  - Latest collections
- **Main content**
  - Grid of color-coded collection cards (background color based on dominant item type)
  - Items shown as color-coded cards (border color based on type)
  - Items open in a **quick-access drawer**

### Design References
- [Notion](https://notion.so) — clean layout and content hierarchy
- [Linear](https://linear.app) — minimal, developer-focused UI
- [Raycast](https://raycast.com) — fast access and keyboard-first UX

### Screenshots

Refer to the screenshots below as a base for the dashaboard UI. It doesn not have to be exact. Use it as a reference:

@context/screenshots/dashboard-ui-main.png
@context/screenshots/dashboard-ui-drawer.png

### Design Tokens
- **Mode:** Dark by default, light mode optional
- **Typography:** Clean, generous whitespace
- **Borders/Shadows:** Subtle
- **Code blocks:** Syntax highlighted

### Micro-interactions
- Smooth transitions on drawers and modals
- Hover states on all cards
- Toast notifications for all actions (create, edit, delete, copy)
- Loading skeletons during data fetch

### Responsive
- Desktop-first layout
- Mobile: sidebar collapses into a drawer

---

## 🔗 Key Dependencies & Docs

| Package | Version | Docs |
|---------|---------|------|
| Next.js | 16 | https://nextjs.org/docs |
| Prisma | 7 (latest) | https://www.prisma.io/docs |
| NextAuth | v5 | https://authjs.dev |
| Tailwind CSS | v4 | https://tailwindcss.com/docs |
| ShadCN UI | latest | https://ui.shadcn.com |
| Cloudflare R2 | — | https://developers.cloudflare.com/r2 |
| Neon DB | — | https://neon.tech/docs |
| OpenAI SDK | latest | https://platform.openai.com/docs |
| Stripe | latest | https://stripe.com/docs |

---

## 🚀 Development Phases (Suggested)

### Phase 1 — Foundation
- [ ] Project setup (Next.js, TypeScript, Tailwind, ShadCN)
- [ ] Prisma schema + first migration
- [ ] NextAuth (email/password + GitHub OAuth)
- [ ] Sidebar layout + routing

### Phase 2 — Core Features
- [ ] Item CRUD (all system types)
- [ ] Item drawer UI
- [ ] Collections CRUD
- [ ] Tags system
- [ ] Search

### Phase 3 — Pro Features
- [ ] Cloudflare R2 file uploads (file/image types)
- [ ] Stripe integration + Pro gating
- [ ] AI features (auto-tag, explain, summarize, prompt optimizer)
- [ ] Export (JSON / ZIP)

### Phase 4 — Polish
- [ ] Mobile responsiveness
- [ ] Dark/light mode toggle
- [ ] Micro-interactions + loading skeletons
- [ ] Performance optimization
- [ ] Custom item types (Pro)

---

*Last updated: May 2026*
