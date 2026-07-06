import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export function HeroText() {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-5">
        Stop Losing Your{' '}
        <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-500 bg-clip-text text-transparent">
          Developer Knowledge
        </span>
      </h1>
      <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
        Your snippets are in VS Code, prompts in chat history, commands in a .txt file, and links
        scattered across 8 browser tabs. DevStash gives you one fast, searchable hub for all of it.
      </p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Link href="/register" className={buttonVariants({ size: 'lg' })}>
          Get Started Free
        </Link>
        <a href="#features" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
          See How It Works
        </a>
      </div>
    </div>
  );
}
