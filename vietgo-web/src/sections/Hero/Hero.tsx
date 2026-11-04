import { useEffect, useState } from 'react';
import { Container } from '@/components/layout/Container';
import { TextReveal } from '@/components/motion/TextReveal';
import { Label } from '@/components/ui/Label';
import { usePageReady } from '@/hooks/usePageReady';
import { cx } from '@/utils/cx';
import styles from './Hero.module.css';

const BASE = `${import.meta.env.BASE_URL}images/`;

interface Slide {
  file: string;
  place: string;
  alt: string;
}

const SLIDES: readonly Slide[] = [
  { file: 'slide-halong-cruise', place: 'Hạ Long Bay', alt: 'The sea and islands of Ha Long Bay' },
  { file: 'slide-sapa', place: 'Sa Pa', alt: 'Morning light over the rice terraces of Sa Pa' },
  { file: 'slide-hoian', place: 'Hội An', alt: 'Lanterns over a street in Hội An' },
  { file: 'slide-danang', place: 'Đà Nẵng', alt: 'The Golden Bridge in the hills above Đà Nẵng' },
];

const src = (slide: Slide, width: 1920 | 3840 = 1920) => `${BASE}${slide.file}-${width}.webp`;

/** The first photo, which the preloader waits for. */
export const HERO_FIRST_IMAGE = src(SLIDES[0]!);

const SLIDE_MS = 6000;

const HEADLINE = [
  'Every rhythm',
  <>
    <em>of</em> Vietnam,
  </>,
  <>
    <em>in one</em> calm app
  </>,
];

/**
 * Cream sheet with a staggered serif headline, over a full-bleed photo that crossfades between
 * places. The photo is pinned, so scrolling slides the sheet up off it and then the next section
 * rises over it, the way the reference's layers peel away.
 */
export function Hero() {
  const ready = usePageReady();
  const [index, setIndex] = useState(0);
  const current = SLIDES[index] ?? SLIDES[0]!;

  useEffect(() => {
    if (!ready || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % SLIDES.length);
    }, SLIDE_MS);
    return () => clearInterval(timer);
  }, [ready]);

  return (
    <section id="top" className={cx(styles.hero, ready && styles.ready)}>
      <div className={styles.sheet} data-tone="light">
        <Container className={styles.content}>
          <TextReveal
            as="h1"
            className={styles.title}
            lines={HEADLINE}
            delay={150}
            waitForReady
            lineClassName={(i) => styles[`line${i + 1}`]}
          />
          <div className={styles.intro}>
            <Label>Vietnam, all in one place</Label>
            <p>
              Stay, eat, move and meet people across Vietnam: one app, picked by locals, calm by
              design.
            </p>
          </div>
        </Container>
        <span className={styles.notch} aria-hidden="true" />
      </div>

      <div className={styles.stage}>
        <div className={styles.frame} data-tone="dark">
          {SLIDES.map((slide, i) => (
            <img
              key={slide.file}
              className={cx(styles.photo, i === index && styles.current)}
              src={src(slide)}
              srcSet={`${src(slide)} 1920w, ${src(slide, 3840)} 3840w`}
              sizes="100vw"
              alt={i === index ? slide.alt : ''}
              aria-hidden={i !== index || undefined}
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'auto'}
              decoding="async"
              draggable={false}
            />
          ))}
          <div className={styles.caption}>
            <span key={index} className={styles.place}>
              ( {current.place} )
            </span>
            <span className={styles.count}>
              {String(index + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
            </span>
          </div>
          <span className={styles.scrollCue} aria-hidden="true">
            Scroll
          </span>
        </div>
      </div>
    </section>
  );
}
