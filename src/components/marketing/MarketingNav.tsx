'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { buttonVariants } from '@/components/ui/button';
import { BrandMark } from '@/components/shared/BrandMark';
import { interactiveProps, overlaySpring, staggerContainerTight, staggerItem } from '@/components/motion/variants';

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass-nav border-b border-border/70 shadow-ambient'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 h-16 lg:h-18 flex items-center gap-6">
        <Link
          href="/"
          className="shrink-0 rounded-lg transition-opacity hover:opacity-85"
          aria-label="DevCodeCave home"
        >
          <BrandMark />
        </Link>

        <div className="hidden md:flex items-center gap-1 ml-2">
          {[
            { label: 'Features', href: '/#features' },
            { label: 'Pricing', href: '/#pricing' },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2 ml-auto">
          <Link href="/sign-in" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            Sign In
          </Link>
          <motion.div {...interactiveProps}>
            <Link
              href="/register"
              className={buttonVariants({ size: 'sm' }) + ' bg-gradient-brand text-white border-0 shadow-lifted'}
            >
              Get Started
            </Link>
          </motion.div>
        </div>

        <button
          className="md:hidden ml-auto tap-target inline-flex items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={overlaySpring}
            className="md:hidden overflow-hidden border-t border-border glass-nav"
          >
            <motion.div
              variants={staggerContainerTight}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-1 px-4 sm:px-6 py-4"
            >
              {[
                { label: 'Features', href: '/#features', external: true },
                { label: 'Pricing', href: '/#pricing', external: true },
                { label: 'Sign In', href: '/sign-in', external: false },
              ].map((link) => (
                <motion.div key={link.label} variants={staggerItem}>
                  {link.external ? (
                    <a
                      href={link.href}
                      className="flex tap-target items-center rounded-xl px-3 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="flex tap-target items-center rounded-xl px-3 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )}
                </motion.div>
              ))}
              <motion.div variants={staggerItem} className="pt-2">
                <Link
                  href="/register"
                  className={buttonVariants({ size: 'lg' }) + ' w-full bg-gradient-brand text-white border-0'}
                  onClick={() => setMenuOpen(false)}
                >
                  Get Started
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
