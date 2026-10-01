import { Boxes } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandMarkProps {
  /** Hide the wordmark and render the glyph only (used in collapsed rails). */
  iconOnly?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: { box: 'h-7 w-7 rounded-lg', icon: 'h-3.5 w-3.5', text: 'text-[15px]' },
  md: { box: 'h-9 w-9 rounded-xl', icon: 'h-[18px] w-[18px]', text: 'text-[17px]' },
  lg: { box: 'h-11 w-11 rounded-2xl', icon: 'h-5 w-5', text: 'text-xl' },
} as const;

/**
 * The DevCodeCave lockup: a gradient glyph tile plus the wordmark.
 * Purely presentational and reused by the marketing nav, dashboard top bar,
 * auth screens and the footer so the brand stays consistent everywhere.
 */
export function BrandMark({ iconOnly = false, className, size = 'md' }: BrandMarkProps) {
  const s = SIZES[size];

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'bg-gradient-brand grid place-items-center text-white shadow-lifted',
          s.box
        )}
      >
        <Boxes className={s.icon} aria-hidden="true" />
      </span>
      {!iconOnly && (
        <span className={cn('font-bold tracking-tight leading-none', s.text)}>
          Dev<span className="text-gradient-brand">CodeCave</span>
        </span>
      )}
    </span>
  );
}
