'use client';

import { Code, Sparkles, Terminal, StickyNote, Upload, LayoutGrid } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { interactiveSubtleProps, staggerContainer, staggerItem } from '@/components/motion/variants';

interface Feature {
  icon: LucideIcon;
  label: string;
  description: string;
  accent: string;
  pro?: boolean;
}

const FEATURES: Feature[] = [
  {
    icon: Code,
    label: 'Code Snippets',
    description: 'Syntax-highlighted, searchable snippets with language detection. Never re-write the same utility function twice.',
    accent: '#4f46e5',
  },
  {
    icon: Sparkles,
    label: 'AI Prompts',
    description: 'Store your best prompts with markdown preview. Quickly copy and reuse across ChatGPT, Claude, and beyond.',
    accent: '#f59e0b',
  },
  {
    icon: Terminal,
    label: 'Commands',
    description: 'Store CLI commands, git aliases, and shell scripts. One-click copy so you stop hunting through bash history.',
    accent: '#06b6d4',
  },
  {
    icon: StickyNote,
    label: 'Notes',
    description: 'Markdown notes with live preview. Write docs, architecture decisions, or meeting notes and find them instantly.',
    accent: '#22c55e',
  },
  {
    icon: Upload,
    label: 'Files & Docs',
    description: 'Upload PDFs, images, context files, and reference docs. Keep them alongside your knowledge, not in a random folder.',
    accent: '#ec4899',
    pro: true,
  },
  {
    icon: LayoutGrid,
    label: 'Collections',
    description: 'Group any item type into named collections — React Patterns, Interview Prep, Client Context. Many-to-many supported.',
    accent: '#8b5cf6',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-24 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-soft">
            Built for developers
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
            Everything a developer needs, in one place
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            Seven item types, built for the way developers actually work.
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6"
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.label} variants={staggerItem}>
                <motion.article
                  {...interactiveSubtleProps}
                  className="ring-highlight group h-full rounded-2xl border border-border bg-card/70 p-6 backdrop-blur-sm shadow-ambient transition-shadow duration-300 hover:shadow-lifted sm:p-7"
                  style={{ ['--accent' as string]: feature.accent }}
                >
                  <div
                    className="mb-5 grid h-12 w-12 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-105"
                    style={{ background: `${feature.accent}1f`, color: feature.accent }}
                  >
                    <Icon className="h-[22px] w-[22px]" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 flex items-center gap-2 text-base font-semibold sm:text-[17px]">
                    {feature.label}
                    {feature.pro && (
                      <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-500">
                        Pro
                      </span>
                    )}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </motion.article>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
