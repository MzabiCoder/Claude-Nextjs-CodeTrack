'use client';

import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/components/motion/variants';

const CHECKLIST = [
  {
    title: 'Auto-tagging',
    description: 'Paste code or a prompt — AI suggests relevant tags so you can find it later without thinking.',
  },
  {
    title: 'Explain This Code',
    description: 'One click to get a plain-English explanation of any snippet or command in your stash.',
  },
  {
    title: 'Prompt Optimizer',
    description: 'Improve any stored prompt with AI suggestions tailored to the model you\'re targeting.',
  },
  {
    title: 'AI Summaries',
    description: 'Long notes or docs? Get a 2-sentence summary surfaced in the search results.',
  },
];

export function AiSection() {
  return (
    <section className="relative isolate overflow-hidden border-y border-border px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="aura-field opacity-60" aria-hidden="true" />
      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-14 lg:gap-20">
        {/* Copy */}
        <div>
          <span className="mb-5 inline-block rounded-md border border-amber-500/30 bg-amber-500/[0.08] px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-amber-500">
            Pro Feature
          </span>
          <h2 className="mb-8 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
            AI that works for developers
          </h2>
          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="flex flex-col gap-5 sm:gap-6"
          >
            {CHECKLIST.map((item) => (
              <motion.li key={item.title} variants={staggerItem} className="flex items-start gap-3.5">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-emerald-500/12 text-emerald-500">
                  <Check className="h-[15px] w-[15px]" aria-hidden="true" />
                </span>
                <div>
                  <p className="mb-1 text-[15px] font-semibold">{item.title}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {/* Editor mockup */}
        <motion.div
          initial={{ opacity: 0, y: 24, rotateX: 4 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-2xl border border-border bg-[#0d1117] shadow-lifted">
          <div className="flex items-center gap-2 px-4 py-3 bg-[#161b22] border-b border-border">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <span className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <span className="ml-auto text-[11px] text-muted-foreground font-mono">TypeScript</span>
          </div>
          <div className="p-5 overflow-x-auto">
            <pre className="text-[13px] leading-[1.75] font-mono min-w-0 max-w-full">
              <code>
                <span className="text-[#ff7b72]">function </span>
                <span className="text-[#d2a8ff]">useDebounce</span>
                <span className="text-foreground/80">{'<'}</span>
                <span className="text-[#79c0ff]">T</span>
                <span className="text-foreground/80">{'>('}
{`
  value: `}</span>
                <span className="text-[#79c0ff]">T</span>
                <span className="text-foreground/80">{`,
  delay: `}</span>
                <span className="text-[#79c0ff]">number</span>
                <span className="text-foreground/80">{`
): `}</span>
                <span className="text-[#79c0ff]">T</span>
                <span className="text-foreground/80">{` {
  `}</span>
                <span className="text-[#ff7b72]">const </span>
                <span className="text-foreground/80">[debouncedValue, setDebouncedValue] =
    useState&lt;</span>
                <span className="text-[#79c0ff]">T</span>
                <span className="text-foreground/80">{`>(value);

  useEffect(() => {
    `}</span>
                <span className="text-[#ff7b72]">const </span>
                <span className="text-foreground/80">{`timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    `}</span>
                <span className="text-[#ff7b72]">return </span>
                <span className="text-foreground/80">{`() => clearTimeout(timer);
  }, [value, delay]);

  `}</span>
                <span className="text-[#ff7b72]">return </span>
                <span className="text-foreground/80">{`debouncedValue;
}`}</span>
              </code>
            </pre>
          </div>
          <div className="px-5 py-3.5 border-t border-border bg-amber-500/[0.04]">
            <p className="text-[10px] font-bold tracking-widest uppercase text-amber-500 mb-2">
              AI Generated Tags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['react', 'hooks', 'debounce', 'performance', 'typescript'].map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-mono text-amber-500 bg-amber-500/10 border border-amber-500/25 rounded px-2 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
