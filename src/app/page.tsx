import { MarketingNav } from '@/components/marketing/MarketingNav';
import { HeroText } from '@/components/marketing/HeroText';
import { HeroChaos } from '@/components/marketing/HeroChaos';
import { FeaturesSection } from '@/components/marketing/FeaturesSection';
import { AiSection } from '@/components/marketing/AiSection';
import { PricingSection } from '@/components/marketing/PricingSection';
import { CtaSection } from '@/components/marketing/CtaSection';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { FadeIn } from '@/components/marketing/FadeIn';
import { AmbientAura } from '@/components/motion';

export default function Page() {
  return (
    <>
      <MarketingNav />

      <main className="flex-1">
        {/* Hero — no FadeIn here; content is above the fold and must be immediately visible */}
        <section className="relative isolate flex min-h-[92svh] flex-col items-center justify-center gap-12 overflow-hidden px-4 pb-16 pt-28 sm:gap-14 sm:px-6 sm:pt-32 lg:px-8">
          <AmbientAura />
          <div className="pointer-events-none absolute inset-0 -z-10 grid-backdrop opacity-40" aria-hidden="true" />
          <div className="mx-auto w-full max-w-7xl">
            <HeroText />
          </div>
          <div className="mx-auto w-full max-w-7xl">
            <HeroChaos />
          </div>
        </section>

        <FadeIn>
          <FeaturesSection />
        </FadeIn>

        <FadeIn>
          <AiSection />
        </FadeIn>

        <FadeIn>
          <PricingSection />
        </FadeIn>

        <FadeIn>
          <CtaSection />
        </FadeIn>
      </main>

      <MarketingFooter />
    </>
  );
}
