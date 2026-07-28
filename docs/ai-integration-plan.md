# AI Integration Plan — DevStash Pro

## Model

**`gpt-4o-mini`** — as specified in the project overview. Cost-effective, fast, sufficient for all four features.

> Note: The research brief mentioned `gpt-5-nano` — that model does not exist. `gpt-4o-mini` is the correct choice.

---

## Features

| Feature | Trigger | Response type | Pro-gated |
|---|---|---|---|
| Auto-tag suggestions | Button in ItemDrawer / NewItemDialog | Array of strings | Yes |
| AI Summary | Button in ItemDrawer | Short paragraph | Yes |
| Explain This Code | Button in ItemDrawer (snippet/command only) | Markdown text | Yes |
| Prompt Optimizer | Button in ItemDrawer (prompt only) | Rewritten prompt | Yes |

---

## 1. SDK Setup

### Install

```bash
npm install openai
```

### Singleton — `src/lib/openai.ts`

```typescript
import OpenAI from 'openai';

let _openai: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}
```

`OPENAI_API_KEY` is server-side only — never prefix with `NEXT_PUBLIC_`.

---

## 2. Server Actions

All AI features follow the same server action pattern already established in `src/actions/items.ts`:

```typescript
'use server';

import { auth } from '@/auth';
import { getUserIsPro } from '@/lib/gates';
import { getOpenAI } from '@/lib/openai';

// Auth → Pro check → validate input → call OpenAI → return { success, data?, error? }
```

### Input limits (prevent cost explosions)

```typescript
const MAX_CONTENT_CHARS = 6000; // ~1500 tokens
const MAX_TITLE_CHARS = 200;

function truncate(s: string | null | undefined, max: number): string {
  if (!s) return '';
  return s.length > max ? s.slice(0, max) + '…' : s;
}
```

---

## 3. Feature Implementations

### 3a. Auto-Tag Suggestions — `src/actions/ai.ts`

Non-streaming. Returns up to 5 tag strings.

```typescript
export async function suggestTags(
  itemId: string
): Promise<{ success: true; tags: string[] } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  const isPro = await getUserIsPro(session.user.id);
  if (!isPro) return { success: false, error: 'AI features require Pro.' };

  const { prisma } = await import('@/lib/prisma');
  const item = await prisma.item.findFirst({
    where: { id: itemId, userId: session.user.id },
    select: { title: true, content: true, itemType: { select: { name: true } } },
  });
  if (!item) return { success: false, error: 'Item not found' };

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 80,
      messages: [
        {
          role: 'system',
          content:
            'You suggest concise, relevant tags for developer content. Return only a JSON array of 3-5 lowercase tag strings. No explanation.',
        },
        {
          role: 'user',
          content: `Type: ${item.itemType.name}\nTitle: ${truncate(item.title, MAX_TITLE_CHARS)}\nContent: ${truncate(item.content, MAX_CONTENT_CHARS)}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0].message.content ?? '{}';
    const parsed = JSON.parse(raw);
    const tags: string[] = Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [];
    return { success: true, tags };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'AI request failed' };
  }
}
```

### 3b. AI Summary

```typescript
export async function summarizeItem(
  itemId: string
): Promise<{ success: true; summary: string } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  const isPro = await getUserIsPro(session.user.id);
  if (!isPro) return { success: false, error: 'AI features require Pro.' };

  const { prisma } = await import('@/lib/prisma');
  const item = await prisma.item.findFirst({
    where: { id: itemId, userId: session.user.id },
    select: { title: true, content: true, description: true, itemType: { select: { name: true } } },
  });
  if (!item) return { success: false, error: 'Item not found' };

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 120,
      messages: [
        {
          role: 'system',
          content:
            'You write concise 1-2 sentence summaries of developer content. Plain text only, no markdown.',
        },
        {
          role: 'user',
          content: `Type: ${item.itemType.name}\nTitle: ${truncate(item.title, MAX_TITLE_CHARS)}\nContent: ${truncate(item.content, MAX_CONTENT_CHARS)}`,
        },
      ],
    });

    const summary = completion.choices[0].message.content?.trim() ?? '';
    return { success: true, summary };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'AI request failed' };
  }
}
```

### 3c. Explain This Code — API Route (streaming)

Streaming gives better UX for longer explanations. Use an API route rather than a server action since server actions don't support streaming responses.

**`src/app/api/ai/explain/route.ts`**

```typescript
import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { getUserIsPro } from '@/lib/gates';
import { getOpenAI } from '@/lib/openai';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const isPro = await getUserIsPro(session.user.id);
  if (!isPro) {
    return new Response('Pro required', { status: 403 });
  }

  const { itemId } = await req.json() as { itemId: string };
  const item = await prisma.item.findFirst({
    where: { id: itemId, userId: session.user.id },
    select: { title: true, content: true, language: true },
  });
  if (!item?.content) {
    return new Response('Item not found or has no content', { status: 404 });
  }

  const stream = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 500,
    stream: true,
    messages: [
      {
        role: 'system',
        content: 'You explain code clearly and concisely for developers. Use markdown.',
      },
      {
        role: 'user',
        content: `Language: ${item.language ?? 'unknown'}\n\n\`\`\`\n${truncate(item.content, MAX_CONTENT_CHARS)}\n\`\`\`\n\nExplain what this code does.`,
      },
    ],
  });

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? '';
        if (text) controller.enqueue(new TextEncoder().encode(text));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

const MAX_CONTENT_CHARS = 6000;
function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max) + '…' : s;
}
```

### 3d. Prompt Optimizer — API Route (streaming)

Same pattern as explain, different system prompt:

```typescript
// system message:
'You are an expert prompt engineer. Rewrite the given prompt to be clearer, more specific, and more effective. Output only the improved prompt.'
```

---

## 4. Pro Gating Pattern

Mirror exactly what `createItem` does — one DB query, consistent error string:

```typescript
const isPro = await getUserIsPro(session.user.id);
if (!isPro) return { success: false, error: 'AI features require a Pro subscription.' };
```

For API routes, return `403` and handle in the client with a redirect or toast to `/upgrade`.

---

## 5. UI Patterns

### Where AI buttons live

All buttons go in `DrawerActionBar` inside `ItemDrawer.tsx`. Show them only when `item.content` is non-empty and the user is Pro.

| Button | Icon | Visibility condition |
|---|---|---|
| Suggest Tags | `Sparkles` | any text type, isPro |
| Summarize | `FileText` | any text type, isPro |
| Explain Code | `BrainCircuit` | snippet or command type, isPro |
| Optimize Prompt | `Wand2` | prompt type, isPro |

For non-Pro users: show the button greyed out with a tooltip "Pro feature" — clicking redirects to `/upgrade`.

### Loading state

```typescript
const [aiLoading, setAiLoading] = useState<'tags' | 'summary' | 'explain' | 'optimize' | null>(null);
```

Disable all AI buttons while any AI call is in flight. Show a `Loader2` spinner inside the active button.

### Accept / Reject pattern (tags & summary)

```typescript
// State
const [suggestedTags, setSuggestedTags] = useState<string[] | null>(null);

// UI: show suggestion below current tags with Accept / Dismiss buttons
{suggestedTags && (
  <div className="flex flex-col gap-2">
    <p className="text-xs text-muted-foreground">AI suggested:</p>
    <div className="flex gap-1 flex-wrap">
      {suggestedTags.map(tag => <Badge key={tag}>{tag}</Badge>)}
    </div>
    <div className="flex gap-2">
      <Button size="sm" onClick={handleAcceptTags}>Apply</Button>
      <Button size="sm" variant="ghost" onClick={() => setSuggestedTags(null)}>Dismiss</Button>
    </div>
  </div>
)}
```

Apply merges suggested tags with existing ones (deduped). Dismiss clears the suggestion.

### Streaming display (explain / optimize)

```typescript
const [streamedText, setStreamedText] = useState('');

async function handleExplain() {
  setAiLoading('explain');
  setStreamedText('');
  const res = await fetch('/api/ai/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId: item.id }),
  });
  if (!res.ok || !res.body) {
    toast.error('AI request failed');
    setAiLoading(null);
    return;
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    setStreamedText(prev => prev + decoder.decode(value));
  }
  setAiLoading(null);
}
```

Render `streamedText` in a `MarkdownEditor` (readonly mode) inside a collapsible section below the drawer content.

---

## 6. Files to Create

| File | Purpose |
|---|---|
| `src/lib/openai.ts` | OpenAI singleton client |
| `src/actions/ai.ts` | `suggestTags`, `summarizeItem` server actions |
| `src/app/api/ai/explain/route.ts` | Streaming explain endpoint |
| `src/app/api/ai/optimize/route.ts` | Streaming prompt optimizer endpoint |
| `src/components/dashboard/AiSuggestionPanel.tsx` | Accept/reject suggestion UI |

## 7. Files to Modify

| File | Change |
|---|---|
| `src/components/dashboard/ItemDrawer.tsx` | Add AI buttons to `DrawerActionBar`, streaming state, suggestion panel |
| `.env` / `.env._production` | Already have `OPENAI_API_KEY` ✓ |
| `.env.example` | Already has `OPENAI_API_KEY` ✓ |

---

## 8. Implementation Order

1. `src/lib/openai.ts` — singleton (5 min)
2. `src/actions/ai.ts` — `suggestTags` + `summarizeItem` (30 min)
3. AI buttons in `DrawerActionBar` for tags + summary with accept/reject UI (45 min)
4. `POST /api/ai/explain` streaming route + explain UI in drawer (45 min)
5. `POST /api/ai/optimize` streaming route + optimize UI in drawer (30 min)
6. Non-Pro upgrade prompt on AI buttons (15 min)
7. Manual testing of all four features end-to-end (30 min)

---

## 9. Cost Estimates (gpt-4o-mini pricing)

| Feature | Avg input tokens | Avg output tokens | Cost/call |
|---|---|---|---|
| Auto-tag | ~400 | ~30 | ~$0.00007 |
| Summary | ~400 | ~50 | ~$0.00009 |
| Explain | ~600 | ~300 | ~$0.00034 |
| Optimize | ~500 | ~300 | ~$0.00030 |

All four features used once = **~$0.0008 per user session**. Negligible at scale.

---

## 10. Security Checklist

- [x] `OPENAI_API_KEY` is server-side only (no `NEXT_PUBLIC_` prefix)
- [ ] Input truncated to `MAX_CONTENT_CHARS = 6000` before every API call
- [ ] All AI endpoints auth-checked (`auth()` at top)
- [ ] All AI endpoints Pro-checked (`getUserIsPro`)
- [ ] API routes scope item lookup to `userId` to prevent accessing other users' content
- [ ] No raw user input interpolated into system prompt (only content field, which is user-owned)
