import { MarketingNav } from '@/components/marketing/MarketingNav';
import { HeroText } from '@/components/marketing/HeroText';
import { HeroChaos } from '@/components/marketing/HeroChaos';
import { FeaturesSection } from '@/components/marketing/FeaturesSection';
import { AiSection } from '@/components/marketing/AiSection';
import { PricingSection } from '@/components/marketing/PricingSection';
import { CtaSection } from '@/components/marketing/CtaSection';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { FadeIn } from '@/components/marketing/FadeIn';

export default function Page() {
  return (
    <>
      <MarketingNav />

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center gap-14 px-6 pt-24 pb-16">
        <FadeIn>
          <HeroText />
        </FadeIn>
        <FadeIn className="w-full">
          <HeroChaos />
        </FadeIn>
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

      <MarketingFooter />
    </>
  );
}
