import { Button } from '@/components/ui/Button';
import { ButtonGroup } from '@/components/ui/ButtonGroup';
import { Container } from '@/components/layout/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Lead } from '@/components/ui/Lead';
import { MediaReveal } from '@/components/motion/MediaReveal';
import { Reveal } from '@/components/motion/Reveal';
import { usePointerTilt } from '@/hooks/usePointerTilt';
import styles from './Cta.module.css';
import { PhoneMockup } from './PhoneMockup';

const PHOTO = `${import.meta.env.BASE_URL}images/slide-halong-sunset-1920.webp`;

/** Closing call to action on a framed sunset photo that drifts gently with the pointer. */
export function Cta() {
  const tiltRef = usePointerTilt<HTMLDivElement>();

  return (
    <section id="download" className={styles.cta}>
      <Container>
        <div ref={tiltRef} className={styles.frame}>
          <MediaReveal className={styles.backdrop}>
            <img className={styles.photo} src={PHOTO} alt="" aria-hidden="true" loading="lazy" />
          </MediaReveal>

          <div className={styles.inner}>
            <Reveal delay={300} className={styles.card}>
              <Eyebrow tone="light">One Vietnam. One vivivu.</Eyebrow>
              <h2>
                Carry the whole
                <br />
                country in your
                <br />
                pocket.
              </h2>
              <Lead tone="light">
                Open vivivu and make every place, plan and journey across Vietnam feel beautifully
                simple.
              </Lead>
              <ButtonGroup>
                <Button href="/app/discover" variant="white" withArrow>
                  Start exploring
                </Button>
                <Button href="/app/register" variant="glass" withArrow>
                  Create a free account
                </Button>
              </ButtonGroup>
            </Reveal>

            <Reveal delay={500}>
              <div className={styles.phone}>
                <PhoneMockup />
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
