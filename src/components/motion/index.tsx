'use client';

/**
 * Presentation-only motion primitives for DevCodeCave.
 *
 * These components wrap `framer-motion` so feature code can opt into the
 * shared animation language without repeating variant definitions. They never
 * touch application state — they only render markup and animate transforms.
 */
import { MotionConfig, motion, useReducedMotion } from 'framer-motion';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  fadeUp,
  interactiveProps,
  interactiveSubtleProps,
  pageVariants,
  staggerContainer,
  staggerContainerTight,
  staggerItem,
} from './variants';

export * from './variants';
export { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

/**
 * App-wide motion configuration. `reducedMotion="user"` makes Framer Motion
 * honour `prefers-reduced-motion` by disabling transform/layout animation
 * while preserving opacity cross-fades.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

type DivProps = ComponentPropsWithoutRef<typeof motion.div>;

/** Page/view level entrance. Place inside `<AnimatePresence mode="wait">`. */
export function MotionPage({ className, children, ...rest }: DivProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={pageVariants}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Orchestrates a cascade for its direct children. */
export function Stagger({
  className,
  children,
  tight = false,
  inView = false,
  ...rest
}: DivProps & { tight?: boolean; inView?: boolean }) {
  const variants = tight ? staggerContainerTight : staggerContainer;
  const activation = inView
    ? { whileInView: 'visible' as const, viewport: { once: true, amount: 0.15 } }
    : { animate: 'visible' as const };

  return (
    <motion.div
      initial="hidden"
      variants={variants}
      className={className}
      {...activation}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** A single cascading child of {@link Stagger}. */
export function StaggerItem({ className, children, ...rest }: DivProps) {
  return (
    <motion.div variants={staggerItem} className={className} {...rest}>
      {children}
    </motion.div>
  );
}

/** Reveals a block once it scrolls into view. */
export function Reveal({ className, children, delay = 0, ...rest }: DivProps & { delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeUp}
      transition={{ delay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/**
 * Hover/tap micro-interaction wrapper for cards and tiles.
 * `subtle` uses a smaller scale plus a slight lift for large surfaces.
 */
export function Interactive({
  className,
  children,
  subtle = false,
  ...rest
}: DivProps & { subtle?: boolean }) {
  const props = subtle ? interactiveSubtleProps : interactiveProps;
  return (
    <motion.div className={className} {...props} {...rest}>
      {children}
    </motion.div>
  );
}

/**
 * Decorative ambient glow used behind hero and auth layouts.
 * Rendered as a static element when the user prefers reduced motion.
 */
export function AmbientAura({ className }: { className?: string }) {
  const reduced = useReducedMotion();

  return (
    <div className={cn('aura-field', className)} aria-hidden="true">
      {!reduced && (
        <motion.div
          className="absolute left-1/2 top-1/3 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full"
          style={{ background: 'var(--glow-b)', filter: 'blur(110px)' }}
          animate={{ opacity: [0.5, 0.85, 0.5], scale: [1, 1.08, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
  );
}
