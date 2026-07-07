'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutGrid, Menu, X } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/85 backdrop-blur-md border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-[17px] shrink-0 hover:opacity-80 transition-opacity">
          <LayoutGrid className="h-5 w-5 text-blue-500" />
          DevStash
        </Link>

        <div className="hidden md:flex items-center gap-6 ml-4">
          <a href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="/#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </a>
        </div>

        <div className="hidden md:flex items-center gap-2 ml-auto">
          <Link href="/sign-in" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            Sign In
          </Link>
          <Link href="/register" className={buttonVariants({ size: 'sm' })}>
            Get Started
          </Link>
        </div>

        <button
          className="md:hidden ml-auto p-1 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden flex flex-col gap-3 px-6 py-4 border-t border-border bg-background/95 backdrop-blur-md">
          <a href="/#features" className="text-sm font-medium text-muted-foreground" onClick={() => setMenuOpen(false)}>
            Features
          </a>
          <a href="/#pricing" className="text-sm font-medium text-muted-foreground" onClick={() => setMenuOpen(false)}>
            Pricing
          </a>
          <Link href="/sign-in" className="text-sm font-medium text-muted-foreground" onClick={() => setMenuOpen(false)}>
            Sign In
          </Link>
          <Link href="/register" className={buttonVariants({ size: 'sm' })} onClick={() => setMenuOpen(false)}>
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
}
