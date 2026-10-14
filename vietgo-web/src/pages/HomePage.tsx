import { StackedSection } from '@/components/layout/StackedSection';
import { Cta } from '@/sections/Cta/Cta';
import { Ecosystem } from '@/sections/Ecosystem/Ecosystem';
import { Hero } from '@/sections/Hero/Hero';
import { Intro } from '@/sections/Intro/Intro';
import { Journey } from '@/sections/Journey/Journey';
import { Places } from '@/sections/Places/Places';
import { SocialProof } from '@/sections/SocialProof/SocialProof';
import { Trust } from '@/sections/Trust/Trust';

/**
 * The landing page: which sections appear and in what order.
 *
 * Sections wrapped in `StackedSection` pile up as you scroll (later layers slide over earlier
 * ones). Journey pins itself and the CTA scrolls normally; both sit above the panels beneath them
 * through their own z-index. Keep these as direct siblings, since the stacking relies on it.
 */
export function HomePage() {
  return (
    <>
      <StackedSection id="top" layer={1} rounded={false}>
        <Hero />
      </StackedSection>
      <StackedSection layer={2}>
        <Intro />
      </StackedSection>
      <StackedSection id="explore" layer={3}>
        <Ecosystem />
      </StackedSection>
      <Journey />
      <StackedSection id="places" layer={5}>
        <Places />
      </StackedSection>
      <StackedSection layer={6}>
        <SocialProof />
      </StackedSection>
      <StackedSection id="trust" layer={7}>
        <Trust />
      </StackedSection>
      <Cta />
    </>
  );
}
