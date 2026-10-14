import { useRef, type ComponentType } from 'react';
import { Container } from '@/components/layout/Container';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Image } from '@/components/ui/Image';
import { Lines } from '@/components/ui/Lines';
import { DESKTOP, gsap, MOTION_OK, useGSAP } from '@/lib/gsap';
import { cx } from '@/utils/cx';
import styles from './Journey.module.css';
import { MOMENTS, type MockKind } from './moments';
import { FeedMock, PlanMock } from './Mocks';

const MOCKS: Record<MockKind, ComponentType> = { feed: FeedMock, plan: PlanMock };

/**
 * Two scenes from a day in Vietnam. On wide screens the stage is pinned and the scenes
 * cross-fade as the user scrolls; on small screens or with reduced motion they simply stack.
 */
export function Journey() {
  const stageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const stage = stageRef.current;
      if (!stage) return;

      const scenes = gsap.utils.toArray<HTMLElement>('[data-scene]', stage);
      const mm = gsap.matchMedia();

      mm.add(`${MOTION_OK} and ${DESKTOP}`, () => {
        gsap.set(scenes.slice(1), { autoAlpha: 0 });

        const timeline = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: stage,
            start: 'top top',
            end: `+=${(scenes.length - 1) * 120}%`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
          },
        });

        scenes.slice(1).forEach((scene, index) => {
          const previous = scenes[index];
          if (!previous) return;
          timeline
            .to(previous, { autoAlpha: 0, duration: 1 })
            .fromTo(scene, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, '<0.35');
        });
      });

      return () => mm.revert();
    },
    { scope: stageRef },
  );

  return (
    <section id="journey" className={styles.journey}>
      <Container className={styles.intro}>
        <SectionHeader
          eyebrow="Made for real days"
          eyebrowTone="mint"
          title={
            <>
              From morning coffee to
              <br />
              the last ride home.
            </>
          }
          lead="vivivu learns the shape of your day, then quietly brings the next useful thing within reach."
          leadTone="light"
        />
      </Container>

      <div ref={stageRef} className={styles.stage}>
        {MOMENTS.map(({ time, titleLines, description, mock, image }, index) => {
          const Mock = MOCKS[mock];
          return (
            <div key={time} data-scene className={styles.scene}>
              <Image image={image} decorative className={styles.photo} />
              <div className={styles.shade} />
              <Container className={cx(styles.sceneInner, index % 2 === 1 && styles.reversed)}>
                <div className={styles.text}>
                  <Eyebrow tone="mint">{time}</Eyebrow>
                  <h3>
                    <Lines lines={titleLines} />
                  </h3>
                  <p>{description}</p>
                  <Button href="#download" size="sm" withArrow>
                    See the journey
                  </Button>
                </div>
                <Mock />
              </Container>
            </div>
          );
        })}
      </div>
    </section>
  );
}
