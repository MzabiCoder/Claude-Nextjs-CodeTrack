import Link from 'next/link';
import { BrandMark } from '@/components/shared/BrandMark';

const LINKS = [
  {
    heading: 'Product',
    items: [
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/#pricing' },
    ],
  },
  {
    heading: 'Account',
    items: [
      { label: 'Sign In', href: '/sign-in' },
      { label: 'Register', href: '/register' },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-14 sm:px-6 md:flex-row lg:px-8">
        <div className="shrink-0">
          <Link href="/" className="inline-flex transition-opacity hover:opacity-85" aria-label="DevCodeCave home">
            <BrandMark />
          </Link>
          <p className="mt-3 max-w-[220px] text-sm leading-relaxed text-muted-foreground">
            One hub for all your developer knowledge.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:gap-16 md:ml-auto md:flex">
          {LINKS.map((col) => (
            <div key={col.heading} className="flex flex-col gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">
                {col.heading}
              </p>
              {col.items.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border px-4 py-5 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
        © {new Date().getFullYear()} DevCodeCave. All rights reserved.
      </div>
    </footer>
  );
}
