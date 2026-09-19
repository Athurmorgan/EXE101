import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { StackedSection } from '@/components/ui/StackedSection';
import { Cta } from '@/sections/Cta/Cta';
import { Ecosystem } from '@/sections/Ecosystem/Ecosystem';
import { Hero } from '@/sections/Hero/Hero';
import { Intro } from '@/sections/Intro/Intro';
import { Journey } from '@/sections/Journey/Journey';
import { Places } from '@/sections/Places/Places';
import { SocialProof } from '@/sections/SocialProof/SocialProof';
import { Trust } from '@/sections/Trust/Trust';
import styles from './App.module.css';

/**
 * Page order. Sections wrapped in `StackedSection` pile up as you scroll (later layers slide
 * over earlier ones). Journey pins itself and the CTA scrolls normally; both sit above the
 * panels beneath them via their own z-index.
 */
export default function App() {
  return (
    <>
      <a className={styles.skipLink} href="#main">
        Skip to content
      </a>

      <Header />

      <main id="main">
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
      </main>

      <Footer />
    </>
  );
}
