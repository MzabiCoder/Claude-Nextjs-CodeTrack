import Link from 'next/link';
import { LayoutGrid } from 'lucide-react';

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
    <footer className="border-t border-border">
      <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col sm:flex-row gap-10">
        <div className="shrink-0">
          <Link href="/" className="flex items-center gap-2 font-bold text-base mb-2 hover:opacity-80 transition-opacity">
            <LayoutGrid className="h-4 w-4 text-blue-500" />
            DevStash
          </Link>
          <p className="text-muted-foreground text-sm max-w-[180px] leading-relaxed">
            One hub for all your developer knowledge.
          </p>
        </div>

        <div className="flex gap-10 sm:gap-16 sm:ml-auto flex-wrap">
          {LINKS.map((col) => (
            <div key={col.heading} className="flex flex-col gap-2.5">
              <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
                {col.heading}
              </p>
              {col.items.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} DevStash. All rights reserved.
      </div>
    </footer>
  );
}
