import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export function CtaSection() {
  return (
    <section className="py-24 px-6 border-t border-border">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          Ready to organize your developer knowledge?
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg mb-8">
          Join developers who stopped losing their best work.
        </p>
        <Link href="/register" className={buttonVariants({ size: 'lg' })}>
          Get Started Free
        </Link>
      </div>
    </section>
  );
}
