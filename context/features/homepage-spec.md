# Homepage

## Overview

Convert the static prototype at `prototypes/homepage/` into a real Next.js marketing page using Tailwind + shadcn. The root `/` currently redirects all visitors to `/dashboard` — change it to show the homepage for guests and redirect authenticated users to `/dashboard`.

## Requirements

### Routing

- `src/app/page.tsx` — server component; call `auth()` and redirect to `/dashboard` if session exists, otherwise render the homepage layout
- Remove or replace the current redirect-only root page

### Link targets

| Element | Destination |
|---|---|
| Logo | `#` (top of page) |
| Features nav link | `#features` |
| Pricing nav link | `#pricing` |
| Sign In button | `/sign-in` |
| Get Started / Get Started Free buttons | `/register` |
| "See How It Works" | `#features` |
| Footer links | matching anchors or pages |

### Component breakdown

**Server components** (no interactivity needed):

- `src/app/page.tsx` — assembles all sections
- `src/components/marketing/HeroText.tsx` — headline, subheadline, CTA buttons
- `src/components/marketing/FeaturesSection.tsx` — 6 feature cards grid
- `src/components/marketing/AiSection.tsx` — Pro checklist + code editor mockup
- `src/components/marketing/CtaSection.tsx` — bottom CTA band
- `src/components/marketing/MarketingFooter.tsx` — logo, link columns, copyright year

**Client components** (`'use client'`):

- `src/components/marketing/MarketingNav.tsx` — fixed nav; adds backdrop-blur + border on scroll via `useEffect` scroll listener; mobile menu toggle
- `src/components/marketing/HeroChaos.tsx` — `useEffect` + `requestAnimationFrame` chaos icon animation (drift, bounce, mouse repel); renders the full hero visual (chaos box + arrow + dashboard mockup)
- `src/components/marketing/PricingSection.tsx` — monthly/yearly toggle state; renders both pricing cards with dynamic price

### Animations & styles

- Scroll fade-in: add a `useFadeIn` hook or use a small `IntersectionObserver` effect in a wrapper client component `FadeIn.tsx` that wraps static sections
- Nav scroll opacity: `useEffect` window scroll listener in `MarketingNav`
- Chaos animation: port directly from `prototypes/homepage/script.js` into `HeroChaos.tsx` using `useRef` for the arena element and `useEffect` for the animation loop + cleanup
- Pulsing arrow: pure CSS `animate-pulse` or a custom Tailwind keyframe
- All colors, spacing, typography via Tailwind — no separate CSS file
- Gradient headline text: use `bg-clip-text text-transparent bg-gradient-to-r` utility classes
- Dashboard mockup skeleton bars: plain `div`s with `rounded` + `bg-white/10` etc — no external lib needed
- Use shadcn `Button` for all CTA buttons

### Sections (in order)

1. `MarketingNav` — fixed top, transparent → scrolled style
2. Hero — `HeroText` (left/center) + `HeroChaos` (visual)
3. `FeaturesSection` — `id="features"`, 3-col grid (2-col tablet, 1-col mobile), 6 cards
4. `AiSection` — 2-col (copy left, editor mockup right), stacks on mobile
5. `PricingSection` — `id="pricing"`, monthly/yearly toggle, Free + Pro cards
6. `CtaSection` — centered headline + button
7. `MarketingFooter`

### Notes

- `MarketingFooter` copyright year: use `new Date().getFullYear()` — this runs server-side so no client component needed
- The `AiSection` code editor mockup is purely decorative HTML — no Monaco, just `<pre><code>` with Tailwind color classes for syntax tokens
- Keep all marketing components in `src/components/marketing/` — separate from dashboard components
- No DB queries on this page — it's fully public and static except for the `auth()` session check
- The existing `src/proxy.ts` (middleware) only protects `/dashboard`, `/items`, `/collections`, `/profile`, `/favorites`, `/settings` — `/` is already public, no changes needed there
