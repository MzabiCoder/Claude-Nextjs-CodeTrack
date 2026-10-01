/**
 * Shared Framer Motion variants for DevCodeCave.
 *
 * Every variant animates only hardware-accelerated properties (`opacity` and
 * `transform`) so transitions stay on the compositor thread. Reduced-motion
 * users are handled globally by `<MotionProvider>` (MotionConfig
 * `reducedMotion="user"`), which neutralises transform/opacity movement
 * without requiring per-component branching.
 */
import type { Transition, Variants } from 'framer-motion';

/** Standard easing curve used for entrances and layout shifts. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Spring used for layered surfaces: modals, drawers, dropdowns, sheets. */
export const overlaySpring: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
};

/** Quick spring for pointer micro-interactions. */
export const tapSpring: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 28,
};

/** Page / route level transition: subtle fade + vertical drift. */
export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

/** Generic fade + rise, used for sections and standalone blocks. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: EASE_OUT } },
};

/** Scale + fade, used for badges, avatars and icon tiles. */
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: overlaySpring },
};

/**
 * Container that cascades its children into view.
 * Pair with {@link staggerItem} on each direct child.
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.08,
    },
  },
};

/** Slightly faster cascade for dense lists (rows, sidebar links). */
export const staggerContainerTight: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.035,
      delayChildren: 0.04,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_OUT },
  },
};

/** Backdrop behind modals, drawers and mobile navigation. */
export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

/** Right-hand item drawer / sheet. */
export const drawerVariants: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: overlaySpring },
  exit: { opacity: 0, x: 24, transition: { duration: 0.18, ease: 'easeIn' } },
};

/** Left slide-over navigation used on mobile. */
export const slideOverVariants: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: overlaySpring },
  exit: { opacity: 0, x: -20, transition: { duration: 0.18, ease: 'easeIn' } },
};

/** Centred dialog surface. */
export const dialogVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: overlaySpring },
  exit: { opacity: 0, scale: 0.97, y: 6, transition: { duration: 0.15, ease: 'easeIn' } },
};

/** Shared hover/tap treatment for interactive cards and buttons. */
export const interactiveProps = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: tapSpring,
} as const;

/** Gentler variant for large surfaces where 2% would feel excessive. */
export const interactiveSubtleProps = {
  whileHover: { scale: 1.01, y: -2 },
  whileTap: { scale: 0.995 },
  transition: tapSpring,
} as const;
