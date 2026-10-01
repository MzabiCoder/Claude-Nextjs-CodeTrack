import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

export function CtaSection() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-brand px-6 py-14 text-center shadow-lifted sm:px-12 sm:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay grid-backdrop"
          aria-hidden="true"
        />
        <div className="relative z-10">
          <h2 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
            Ready to organize your developer knowledge?
          </h2>
          <p className="mx-auto mb-9 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            Join developers who stopped losing their best work.
          </p>
          <Link
            href="/register"
            className={
              buttonVariants({ size: 'lg' }) +
              ' bg-white text-[oklch(0.3_0.16_269)] border-0 shadow-lifted hover:bg-white/90'
            }
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
