import { useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { ButtonGroup } from '@/components/ui/ButtonGroup';
import { Container } from '@/components/layout/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { ParallaxLayer } from '@/components/motion/ParallaxLayer';
import { Reveal } from '@/components/motion/Reveal';
import { TextReveal } from '@/components/motion/TextReveal';
import { useScrolledPast } from '@/hooks/useScrolledPast';
import { gsap, MOTION_OK, useGSAP } from '@/lib/gsap';
import styles from './Hero.module.css';
import { HeroSlideshow } from './HeroSlideshow';
import { SlideIndicator } from './SlideIndicator';
import { SLIDES } from './slides';
import { useSlideshow } from './useSlideshow';

/** Once the page is scrolled a full screen the hero is completely covered by the next section. */
const viewportHeight = () => window.innerHeight;

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrolledAway = useScrolledPast(viewportHeight);
  const { index, previous, ready } = useSlideshow(SLIDES, scrolledAway);

  // As the hero scrolls away, its copy drifts up and fades so the photo takes over.
  useGSAP(
    () => {
      const hero = heroRef.current;
      const content = contentRef.current;
      if (!hero || !content) return;

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.to(content, {
          yPercent: -14,
          opacity: 0,
          ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: '70% top', scrub: true },
        });
      });

      return () => mm.revert();
    },
    { scope: heroRef },
  );

  return (
    <section ref={heroRef} className={styles.hero}>
      <ParallaxLayer fromTop className={styles.photo}>
        <HeroSlideshow activeIndex={index} previousIndex={previous} ready={ready} />
      </ParallaxLayer>
      <div className={styles.shade} />

      <Container className={styles.container}>
        <div ref={contentRef} className={styles.content}>
          <Reveal>
            <Eyebrow tone="mint">Vietnam, all in one place</Eyebrow>
          </Reveal>

          <TextReveal
            as="h1"
            variant="ink"
            className={styles.title}
            lines={['One app.', 'Every rhythm', 'of Vietnam.']}
            delay={150}
          />

          <Reveal as="p" delay={700} className={styles.sub}>
            Meet people. Find phở. Book a room. Catch a ride. Pay with confidence. vivivu moves with
            your day—from first light to late night.
          </Reveal>

          <Reveal delay={850}>
            <ButtonGroup>
              <Button href="/app/discover" variant="white" withArrow>
                Explore places
              </Button>
              <Button href="/app/trips/new" variant="red" withArrow>
                Plan a trip with AI
              </Button>
            </ButtonGroup>
          </Reveal>
        </div>
      </Container>

      <div className={styles.bottom}>
        <Container>
          <SlideIndicator activeIndex={index} playing={ready && !scrolledAway} />
        </Container>
      </div>

      <a href="#explore" className={styles.scroll}>
        <span>Scroll to explore</span>
        <i className={styles.scrollLine} />
      </a>
    </section>
  );
}
