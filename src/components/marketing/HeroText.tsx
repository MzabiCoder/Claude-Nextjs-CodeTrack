'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { buttonVariants } from '@/components/ui/button';
import { interactiveProps, staggerContainer, staggerItem } from '@/components/motion/variants';

export function HeroText() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="relative z-10 mx-auto max-w-3xl text-center"
    >
      <motion.div variants={staggerItem} className="mb-6 flex justify-center">
        <span className="ring-highlight inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-md sm:text-[13px]">
          <Sparkles className="h-3.5 w-3.5 text-brand-violet" aria-hidden="true" />
          AI-assisted capture, tagging &amp; search
        </span>
      </motion.div>

      <motion.h1
        variants={staggerItem}
        className="mb-5 text-[2.5rem] font-extrabold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl"
      >
        Stop Losing Your{' '}
        <span className="text-gradient-brand">Developer Knowledge</span>
      </motion.h1>

      <motion.p
        variants={staggerItem}
        className="mx-auto mb-9 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
      >
        Your snippets are in VS Code, prompts in chat history, commands in a .txt file, and links
        scattered across 8 browser tabs. DevCodeCave gives you one fast, searchable hub for all of it.
      </motion.p>

      <motion.div
        variants={staggerItem}
        className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
      >
        <motion.div {...interactiveProps}>
          <Link
            href="/register"
            className={buttonVariants({ size: 'lg' }) + ' w-full bg-gradient-brand text-white border-0 shadow-lifted sm:w-auto'}
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </motion.div>
        <motion.div {...interactiveProps}>
          <a
            href="#features"
            className={buttonVariants({ size: 'lg', variant: 'outline' }) + ' w-full bg-card/50 backdrop-blur-md sm:w-auto'}
          >
            See How It Works
          </a>
        </motion.div>
      </motion.div>

      <motion.p variants={staggerItem} className="mt-6 text-xs text-muted-foreground sm:text-[13px]">
        Free forever plan · No credit card required
      </motion.p>
    </motion.div>
  );
}
