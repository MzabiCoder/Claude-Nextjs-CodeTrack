import { Code, Sparkles, Terminal, StickyNote, Upload, LayoutGrid } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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
    accent: '#3b82f6',
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
    accent: '#6b7280',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Everything a developer needs, in one place
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Seven item types, built for the way developers actually work.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.label}
                className="group bg-card border border-border rounded-xl p-6 transition-all duration-200 hover:shadow-lg"
                style={{ ['--accent' as string]: feature.accent }}
              >
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: `${feature.accent}1a`, color: feature.accent }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                  {feature.label}
                  {feature.pro && (
                    <span className="text-[10px] font-bold tracking-wider uppercase text-amber-500 border border-amber-500/30 rounded px-1.5 py-0.5">
                      Pro
                    </span>
                  )}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
