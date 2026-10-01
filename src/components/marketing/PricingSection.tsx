'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { buttonVariants } from '@/components/ui/button';
import { interactiveProps, overlaySpring, staggerContainer, staggerItem } from '@/components/motion/variants';

const FREE_FEATURES = [
  { text: '50 items', included: true },
  { text: '3 collections', included: true },
  { text: 'Snippets, prompts, commands, notes, links', included: true },
  { text: 'Instant search', included: true },
  { text: 'File & image uploads', included: false },
  { text: 'AI features', included: false },
  { text: 'Data export', included: false },
];

const PRO_FEATURES = [
  'Unlimited items',
  'Unlimited collections',
  'All item types',
  'File & image uploads',
  'AI auto-tagging',
  'AI code explanation',
  'Prompt optimizer',
  'Data export (JSON/ZIP)',
  'Priority support',
];

export function PricingSection() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="scroll-mt-24 border-t border-border px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-soft">
            Pricing
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
            Simple, transparent pricing
          </h2>
          <p className="mb-8 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Start free, upgrade when you need more.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card/60 px-4 py-2 backdrop-blur-md">
            <span className={`text-sm font-medium transition-colors ${!yearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <button
              role="switch"
              aria-checked={yearly}
              aria-label="Toggle yearly billing"
              onClick={() => setYearly(y => !y)}
              className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
                yearly ? 'bg-gradient-brand border-transparent' : 'bg-muted border-border'
              }`}
            >
              <motion.span
                layout
                transition={overlaySpring}
                className="absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm"
                style={{ left: yearly ? 'calc(100% - 21px)' : '3px' }}
              />
            </button>
            <span className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${yearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Yearly
              <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-px text-[11px] font-semibold text-emerald-500">
                Save 25%
              </span>
            </span>
          </div>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          className="mx-auto grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2 lg:max-w-4xl lg:gap-8"
        >
          {/* Free */}
          <motion.div variants={staggerItem}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={overlaySpring}
              className="flex h-full flex-col rounded-2xl border border-border bg-card/70 p-7 backdrop-blur-sm shadow-ambient sm:p-8"
            >
              <h3 className="mb-3 text-xl font-bold">Free</h3>
              <div className="mb-1 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight sm:text-5xl">$0</span>
                <span className="text-sm text-muted-foreground">forever</span>
              </div>
              <div className="mb-6 h-4" aria-hidden="true" />
              <Link href="/register" className={buttonVariants({ variant: 'outline', size: 'lg' }) + ' mb-7 w-full'}>
                Get Started
              </Link>
              <ul className="flex flex-col gap-3.5">
                {FREE_FEATURES.map((f) => (
                  <li key={f.text} className={`flex items-start gap-2.5 text-sm ${f.included ? '' : 'text-muted-foreground/70'}`}>
                    {f.included
                      ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                      : <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" aria-hidden="true" />}
                    {f.text}
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>

          {/* Pro */}
          <motion.div variants={staggerItem}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={overlaySpring}
              className="ring-highlight relative flex h-full flex-col rounded-2xl border-2 border-primary/70 bg-card p-7 shadow-lifted sm:p-8"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-brand px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white shadow-lifted">
                Most Popular
              </div>
              <h3 className="mb-3 text-xl font-bold">Pro</h3>
              <div className="mb-1 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                  {yearly ? '$72' : '$8'}
                </span>
                <span className="text-sm text-muted-foreground">
                  {yearly ? '/year' : '/month'}
                </span>
              </div>
              <p className="mb-6 h-4 text-xs text-muted-foreground">
                {yearly ? 'Just $6/month — save 25%' : ''}
              </p>
              <motion.div {...interactiveProps} className="mb-7">
                <Link href="/register" className={buttonVariants({ size: 'lg' }) + ' w-full bg-gradient-brand text-white border-0'}>
                  Get Started
                </Link>
              </motion.div>
              <ul className="flex flex-col gap-3.5">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
