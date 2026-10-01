'use client';

import { motion } from 'framer-motion';
import { fadeUp } from '@/components/motion/variants';

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Scroll-triggered reveal for marketing sections.
 * Backed by Framer Motion's viewport observer; `MotionConfig reducedMotion="user"`
 * in the root layout neutralises the movement for reduced-motion users.
 */
export function FadeIn({ children, className = '' }: FadeInProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}
