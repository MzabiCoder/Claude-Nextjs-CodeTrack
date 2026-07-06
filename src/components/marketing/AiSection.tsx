import { Check } from 'lucide-react';

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
    <section className="py-24 px-6 border-t border-border bg-blue-500/[0.02]">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
        {/* Copy */}
        <div>
          <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-amber-500 border border-amber-500/30 bg-amber-500/[0.06] rounded-md px-2.5 py-1 mb-5">
            Pro Feature
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8 leading-tight">
            AI that works for developers
          </h2>
          <ul className="flex flex-col gap-6">
            {CHECKLIST.map((item) => (
              <li key={item.title} className="flex gap-3.5 items-start">
                <Check className="h-[18px] w-[18px] text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm mb-1">{item.title}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Editor mockup */}
        <div className="rounded-xl overflow-hidden border border-border bg-[#0d1117]">
          <div className="flex items-center gap-2 px-4 py-3 bg-[#161b22] border-b border-border">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <span className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <span className="ml-auto text-[11px] text-muted-foreground font-mono">TypeScript</span>
          </div>
          <div className="p-5 overflow-x-auto">
            <pre className="text-[13px] leading-[1.75] font-mono">
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
        </div>
      </div>
    </section>
  );
}
