import { Container } from '@/components/layout/Container';
import { MediaReveal } from '@/components/motion/MediaReveal';
import { Reveal } from '@/components/motion/Reveal';
import { TextReveal } from '@/components/motion/TextReveal';
import { Image } from '@/components/ui/Image';
import { IMAGES } from '@/data/images';
import styles from './Statement.module.css';

const LINES = [
  'a country',
  'close',
  <>
    <em>to you</em>
  </>,
];

/**
 * Rises over the pinned hero photo like a fresh sheet of paper: a three-line statement spread
 * across the page, then a pair of photos at different scroll speeds with a caption plate.
 */
export function Statement() {
  return (
    <section className={styles.statement} data-tone="light">
      <Container>
        <TextReveal
          as="h2"
          className={styles.title}
          lines={LINES}
          lineClassName={(i) => styles[`line${i + 1}`]}
        />

        <Reveal className={styles.copy} delay={200}>
          <p>
            vivivu is a calm, thoughtful travel companion for people who want Vietnam the way locals
            live it. Here you can slow down, skip the guesswork, and spend the trip on what matters.
          </p>
        </Reveal>

        <div className={styles.photos}>
          <div className={styles.small}>
            <MediaReveal className={styles.smallFrame}>
              <Image image={IMAGES.pho} />
            </MediaReveal>
          </div>

          <div className={styles.large}>
            <MediaReveal parallax className={styles.largeFrame} delay={120}>
              <Image image={IMAGES.hanoi} />
            </MediaReveal>
            <Reveal className={styles.plate} delay={500}>
              <p>
                Every place in the app was walked, eaten at or slept in by someone who lives nearby.
                No paid rankings, no tourist traps: just the city as it really runs.
              </p>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
