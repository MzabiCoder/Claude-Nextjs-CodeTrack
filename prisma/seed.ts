import "dotenv/config";
import { PrismaClient, ContentType } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const systemItemTypes = [
  { name: "snippet", icon: "Code", color: "#3b82f6", isSystem: true },
  { name: "prompt", icon: "Sparkles", color: "#8b5cf6", isSystem: true },
  { name: "command", icon: "Terminal", color: "#f97316", isSystem: true },
  { name: "note", icon: "StickyNote", color: "#fde047", isSystem: true },
  { name: "file", icon: "File", color: "#6b7280", isSystem: true },
  { name: "image", icon: "Image", color: "#ec4899", isSystem: true },
  { name: "link", icon: "Link", color: "#10b981", isSystem: true },
];

async function main() {
  console.log("Seeding system item types...");
  for (const type of systemItemTypes) {
    const existing = await prisma.itemType.findFirst({
      where: { name: type.name, userId: null },
    });
    if (!existing) {
      await prisma.itemType.create({ data: { ...type, userId: null } });
    }
  }

  console.log("Seeding demo user...");
  const hashedPassword = await bcrypt.hash("12345678", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@devstash.io" },
    update: {},
    create: {
      email: "demo@devstash.io",
      name: "Demo User",
      password: hashedPassword,
      isPro: false,
      emailVerified: new Date(),
    },
  });

  const typeMap = Object.fromEntries(
    (
      await prisma.itemType.findMany({
        where: { isSystem: true, userId: null },
      })
    ).map((t) => [t.name, t.id])
  );

  console.log("Seeding collections and items...");

  // ── React Patterns ──────────────────────────────────────────────
  const reactPatterns = await prisma.collection.upsert({
    where: { id: "seed-collection-react-patterns" },
    update: {},
    create: {
      id: "seed-collection-react-patterns",
      name: "React Patterns",
      description: "Reusable React patterns and hooks",
      userId: user.id,
    },
  });

  const reactItems = await Promise.all([
    prisma.item.upsert({
      where: { id: "seed-item-use-debounce" },
      update: {},
      create: {
        id: "seed-item-use-debounce",
        title: "useDebounce & useLocalStorage hooks",
        contentType: ContentType.TEXT,
        language: "typescript",
        content: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    setStoredValue(value);
    window.localStorage.setItem(key, JSON.stringify(value));
  };

  return [storedValue, setValue] as const;
}`,
        userId: user.id,
        itemTypeId: typeMap.snippet,
      },
    }),
    prisma.item.upsert({
      where: { id: "seed-item-context-provider" },
      update: {},
      create: {
        id: "seed-item-context-provider",
        title: "Context provider + compound component pattern",
        contentType: ContentType.TEXT,
        language: "typescript",
        content: `import { createContext, useContext, useState, ReactNode } from 'react';

interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  return (
    <ThemeContext.Provider value={{ theme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}`,
        userId: user.id,
        itemTypeId: typeMap.snippet,
      },
    }),
    prisma.item.upsert({
      where: { id: "seed-item-utility-fns" },
      update: {},
      create: {
        id: "seed-item-utility-fns",
        title: "Common utility functions (cn, formatDate, truncate)",
        contentType: ContentType.TEXT,
        language: "typescript",
        content: `import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    .format(new Date(date));
}

export function truncate(str: string, maxLength: number): string {
  return str.length <= maxLength ? str : str.slice(0, maxLength - 1) + '…';
}`,
        userId: user.id,
        itemTypeId: typeMap.snippet,
      },
    }),
  ]);

  await Promise.all(
    reactItems.map((item) =>
      prisma.itemCollection.upsert({
        where: { itemId_collectionId: { itemId: item.id, collectionId: reactPatterns.id } },
        update: {},
        create: { itemId: item.id, collectionId: reactPatterns.id },
      })
    )
  );

  // ── AI Workflows ─────────────────────────────────────────────────
  const aiWorkflows = await prisma.collection.upsert({
    where: { id: "seed-collection-ai-workflows" },
    update: {},
    create: {
      id: "seed-collection-ai-workflows",
      name: "AI Workflows",
      description: "AI prompts and workflow automations",
      userId: user.id,
    },
  });

  const aiItems = await Promise.all([
    prisma.item.upsert({
      where: { id: "seed-item-code-review-prompt" },
      update: {},
      create: {
        id: "seed-item-code-review-prompt",
        title: "Code review prompt",
        contentType: ContentType.TEXT,
        content: `You are a senior software engineer performing a thorough code review. Review the following code and provide feedback on:

1. **Correctness** — Are there bugs, edge cases, or logic errors?
2. **Security** — Any vulnerabilities (injection, auth bypass, data exposure)?
3. **Performance** — N+1 queries, unnecessary re-renders, memory leaks?
4. **Readability** — Is the code clear, well-named, and easy to follow?
5. **Patterns** — Does it match the codebase conventions?

For each issue found, explain WHY it's a problem and suggest a concrete fix. Be direct and concise.

\`\`\`
{PASTE_CODE_HERE}
\`\`\``,
        userId: user.id,
        itemTypeId: typeMap.prompt,
      },
    }),
    prisma.item.upsert({
      where: { id: "seed-item-doc-gen-prompt" },
      update: {},
      create: {
        id: "seed-item-doc-gen-prompt",
        title: "Documentation generation prompt",
        contentType: ContentType.TEXT,
        content: `Generate clear, concise documentation for the following code. Include:

- A one-sentence summary of what it does
- Parameters/arguments with types and descriptions
- Return value description
- One usage example

Keep the tone technical but approachable. Do not repeat what is already obvious from the code itself.

\`\`\`
{PASTE_CODE_HERE}
\`\`\``,
        userId: user.id,
        itemTypeId: typeMap.prompt,
      },
    }),
    prisma.item.upsert({
      where: { id: "seed-item-refactor-prompt" },
      update: {},
      create: {
        id: "seed-item-refactor-prompt",
        title: "Refactoring assistance prompt",
        contentType: ContentType.TEXT,
        content: `Refactor the following code to improve readability and maintainability without changing its external behavior. Specifically:

- Eliminate duplication (DRY)
- Simplify complex conditionals
- Improve variable and function names
- Break large functions into focused helpers
- Remove dead code

Show the refactored version and briefly explain each change you made.

\`\`\`
{PASTE_CODE_HERE}
\`\`\``,
        userId: user.id,
        itemTypeId: typeMap.prompt,
      },
    }),
  ]);

  await Promise.all(
    aiItems.map((item) =>
      prisma.itemCollection.upsert({
        where: { itemId_collectionId: { itemId: item.id, collectionId: aiWorkflows.id } },
        update: {},
        create: { itemId: item.id, collectionId: aiWorkflows.id },
      })
    )
  );

  // ── DevOps ───────────────────────────────────────────────────────
  const devops = await prisma.collection.upsert({
    where: { id: "seed-collection-devops" },
    update: {},
    create: {
      id: "seed-collection-devops",
      name: "DevOps",
      description: "Infrastructure and deployment resources",
      userId: user.id,
    },
  });

  const devopsItems = await Promise.all([
    prisma.item.upsert({
      where: { id: "seed-item-dockerfile" },
      update: {},
      create: {
        id: "seed-item-dockerfile",
        title: "Next.js multi-stage Dockerfile",
        contentType: ContentType.TEXT,
        language: "dockerfile",
        content: `FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]`,
        userId: user.id,
        itemTypeId: typeMap.snippet,
      },
    }),
    prisma.item.upsert({
      where: { id: "seed-item-deploy-cmd" },
      update: {},
      create: {
        id: "seed-item-deploy-cmd",
        title: "Zero-downtime deploy with Docker Compose",
        contentType: ContentType.TEXT,
        content: `docker compose pull && docker compose up -d --remove-orphans && docker image prune -f`,
        userId: user.id,
        itemTypeId: typeMap.command,
      },
    }),
    prisma.item.upsert({
      where: { id: "seed-item-neon-docs" },
      update: {},
      create: {
        id: "seed-item-neon-docs",
        title: "Neon PostgreSQL documentation",
        contentType: ContentType.URL,
        url: "https://neon.tech/docs/introduction",
        description: "Official Neon serverless Postgres docs — branching, connection pooling, and more.",
        userId: user.id,
        itemTypeId: typeMap.link,
      },
    }),
    prisma.item.upsert({
      where: { id: "seed-item-gh-actions-docs" },
      update: {},
      create: {
        id: "seed-item-gh-actions-docs",
        title: "GitHub Actions documentation",
        contentType: ContentType.URL,
        url: "https://docs.github.com/en/actions",
        description: "Automate CI/CD workflows with GitHub Actions — triggers, jobs, runners, and secrets.",
        userId: user.id,
        itemTypeId: typeMap.link,
      },
    }),
  ]);

  await Promise.all(
    devopsItems.map((item) =>
      prisma.itemCollection.upsert({
        where: { itemId_collectionId: { itemId: item.id, collectionId: devops.id } },
        update: {},
        create: { itemId: item.id, collectionId: devops.id },
      })
    )
  );

  // ── Terminal Commands ─────────────────────────────────────────────
  const terminalCmds = await prisma.collection.upsert({
    where: { id: "seed-collection-terminal-commands" },
    update: {},
    create: {
      id: "seed-collection-terminal-commands",
      name: "Terminal Commands",
      description: "Useful shell commands for everyday development",
      userId: user.id,
    },
  });

  const terminalItems = await Promise.all([
    prisma.item.upsert({
      where: { id: "seed-item-git-undo" },
      update: {},
      create: {
        id: "seed-item-git-undo",
        title: "Git — undo last commit (keep changes staged)",
        contentType: ContentType.TEXT,
        content: `git reset --soft HEAD~1`,
        userId: user.id,
        itemTypeId: typeMap.command,
      },
    }),
    prisma.item.upsert({
      where: { id: "seed-item-docker-clean" },
      update: {},
      create: {
        id: "seed-item-docker-clean",
        title: "Docker — remove all stopped containers, dangling images, and unused volumes",
        contentType: ContentType.TEXT,
        content: `docker system prune --volumes -f`,
        userId: user.id,
        itemTypeId: typeMap.command,
      },
    }),
    prisma.item.upsert({
      where: { id: "seed-item-kill-port" },
      update: {},
      create: {
        id: "seed-item-kill-port",
        title: "Kill process on a specific port",
        contentType: ContentType.TEXT,
        content: `lsof -ti tcp:3000 | xargs kill -9`,
        userId: user.id,
        itemTypeId: typeMap.command,
      },
    }),
    prisma.item.upsert({
      where: { id: "seed-item-npm-clean" },
      update: {},
      create: {
        id: "seed-item-npm-clean",
        title: "npm — clean install from lockfile",
        contentType: ContentType.TEXT,
        content: `rm -rf node_modules && npm ci`,
        userId: user.id,
        itemTypeId: typeMap.command,
      },
    }),
  ]);

  await Promise.all(
    terminalItems.map((item) =>
      prisma.itemCollection.upsert({
        where: { itemId_collectionId: { itemId: item.id, collectionId: terminalCmds.id } },
        update: {},
        create: { itemId: item.id, collectionId: terminalCmds.id },
      })
    )
  );

  // ── Design Resources ──────────────────────────────────────────────
  const designResources = await prisma.collection.upsert({
    where: { id: "seed-collection-design-resources" },
    update: {},
    create: {
      id: "seed-collection-design-resources",
      name: "Design Resources",
      description: "UI/UX resources and references",
      userId: user.id,
    },
  });

  const designItems = await Promise.all([
    prisma.item.upsert({
      where: { id: "seed-item-tailwind-docs" },
      update: {},
      create: {
        id: "seed-item-tailwind-docs",
        title: "Tailwind CSS v4 documentation",
        contentType: ContentType.URL,
        url: "https://tailwindcss.com/docs",
        description: "Official Tailwind CSS docs — utility classes, theming with @theme, and responsive design.",
        userId: user.id,
        itemTypeId: typeMap.link,
      },
    }),
    prisma.item.upsert({
      where: { id: "seed-item-shadcn-docs" },
      update: {},
      create: {
        id: "seed-item-shadcn-docs",
        title: "shadcn/ui components",
        contentType: ContentType.URL,
        url: "https://ui.shadcn.com/docs/components",
        description: "Accessible, composable component library built on Radix UI and Tailwind CSS.",
        userId: user.id,
        itemTypeId: typeMap.link,
      },
    }),
    prisma.item.upsert({
      where: { id: "seed-item-radix-docs" },
      update: {},
      create: {
        id: "seed-item-radix-docs",
        title: "Radix UI primitives",
        contentType: ContentType.URL,
        url: "https://www.radix-ui.com/primitives/docs/overview/introduction",
        description: "Unstyled, accessible UI primitives for building design systems.",
        userId: user.id,
        itemTypeId: typeMap.link,
      },
    }),
    prisma.item.upsert({
      where: { id: "seed-item-lucide-icons" },
      update: {},
      create: {
        id: "seed-item-lucide-icons",
        title: "Lucide React icons",
        contentType: ContentType.URL,
        url: "https://lucide.dev/icons",
        description: "Searchable library of open-source icons with React component support.",
        userId: user.id,
        itemTypeId: typeMap.link,
      },
    }),
  ]);

  await Promise.all(
    designItems.map((item) =>
      prisma.itemCollection.upsert({
        where: { itemId_collectionId: { itemId: item.id, collectionId: designResources.id } },
        update: {},
        create: { itemId: item.id, collectionId: designResources.id },
      })
    )
  );

  console.log("Seeding complete!");
  console.log(`  • 1 demo user`);
  console.log(`  • 7 system item types`);
  console.log(`  • 5 collections`);
  console.log(`  • ${reactItems.length + aiItems.length + devopsItems.length + terminalItems.length + designItems.length} items`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
