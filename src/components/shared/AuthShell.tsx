import Link from 'next/link';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { BrandMark } from '@/components/shared/BrandMark';
import { AmbientAura } from '@/components/motion';

/**
 * Shared frame for every unauthenticated screen (sign in, register,
 * forgot/reset password). Presentation only — the forms it wraps keep their
 * own state and submit handlers untouched.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingNav />
      <main className="relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 pb-16 pt-24 sm:px-6 sm:pt-28">
        <AmbientAura />
        <div className="pointer-events-none absolute inset-0 -z-10 grid-backdrop opacity-40" aria-hidden="true" />

        <Link
          href="/"
          className="relative z-10 mb-8 inline-flex transition-opacity hover:opacity-85"
          aria-label="DevCodeCave home"
        >
          <BrandMark size="lg" />
        </Link>

        <div className="relative z-10 w-full max-w-sm">{children}</div>
      </main>
    </>
  );
}
