'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, FolderOpen, Star, Plus, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { tapSpring } from '@/components/motion/variants';

interface MobileBottomNavProps {
  onNewItemClick?: () => void;
  onSearchClick?: () => void;
}

const LINKS = [
  { href: '/dashboard', label: 'Home', icon: LayoutGrid },
  { href: '/collections', label: 'Collections', icon: FolderOpen },
  { href: '/favorites', label: 'Favorites', icon: Star },
];

/**
 * Thumb-reachable navigation for small viewports. Mirrors the destinations
 * already present in the sidebar and top bar — it introduces no new
 * behaviour, only a mobile-appropriate surface for existing actions.
 */
export function MobileBottomNav({ onNewItemClick, onSearchClick }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="glass-nav pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-border md:hidden"
      aria-label="Primary"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'tap-target relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition-colors',
                isActive ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="bottom-nav-active"
                  transition={tapSpring}
                  className="absolute inset-x-2 inset-y-1 -z-10 rounded-xl bg-accent"
                />
              )}
              <Icon className={cn('h-5 w-5', isActive && 'text-primary')} aria-hidden="true" />
              {label}
            </Link>
          );
        })}

        <button
          onClick={onSearchClick}
          className="tap-target flex flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium text-muted-foreground transition-colors"
        >
          <Search className="h-5 w-5" aria-hidden="true" />
          Search
        </button>

        <motion.button
          whileTap={{ scale: 0.92 }}
          transition={tapSpring}
          onClick={onNewItemClick}
          aria-label="New item"
          className="tap-target ml-1 grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-white shadow-lifted"
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
        </motion.button>
      </div>
    </nav>
  );
}
