import type { ComponentType } from 'react';
import { Container } from '@/components/layout/Container';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { MediaReveal } from '@/components/motion/MediaReveal';
import { Reveal } from '@/components/motion/Reveal';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Image } from '@/components/ui/Image';
import { Lines } from '@/components/ui/Lines';
import { usePointerTilt } from '@/hooks/usePointerTilt';
import { cx } from '@/utils/cx';
import styles from './Journey.module.css';
import { MOMENTS, type Moment, type MockKind } from './moments';
import { FeedMock, PlanMock } from './Mocks';

const MOCKS: Record<MockKind, ComponentType> = { feed: FeedMock, plan: PlanMock };

/** Two moments from a day in Vietnam: copy beside a framed photo that wipes up into view. */
export function Journey() {
  return (
    <section id="journey" className={styles.journey}>
      <Container>
        <SectionHeader
          eyebrow="Made for real days"
          title={
            <>
              From morning coffee to
              <br />
              the last ride home.
            </>
          }
          leadTone="green"
          lead="vivivu learns the shape of your day, then quietly brings the next useful thing within reach."
        />

        <div className={styles.scenes}>
          {MOMENTS.map((moment, index) => (
            <Scene key={moment.time} moment={moment} reversed={index % 2 === 1} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function Scene({ moment, reversed }: { moment: Moment; reversed: boolean }) {
  const { time, titleLines, description, mock, image } = moment;
  const Mock = MOCKS[mock];
  const tiltRef = usePointerTilt<HTMLDivElement>();

  return (
    <article className={cx(styles.scene, reversed && styles.reversed)}>
      <div className={styles.text}>
        <Reveal>
          <Eyebrow>{time}</Eyebrow>
        </Reveal>
        <Reveal as="h3" delay={100}>
          <Lines lines={titleLines} />
        </Reveal>
        <Reveal as="p" delay={200}>
          {description}
        </Reveal>
        <Reveal delay={300}>
          <Button href="#download" size="sm" variant="outline" withArrow>
            See the journey
          </Button>
        </Reveal>
      </div>

      <div ref={tiltRef} className={styles.visual}>
        <MediaReveal className={styles.frame}>
          <Image image={image} decorative className={styles.photo} />
        </MediaReveal>
        <div className={styles.mock}>
          <Reveal delay={450}>
            <Mock />
          </Reveal>
        </div>
      </div>
    </article>
  );
}
