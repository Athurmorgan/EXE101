import { Button } from '@/components/ui/Button';
import { ButtonGroup } from '@/components/ui/ButtonGroup';
import { Container } from '@/components/layout/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Lead } from '@/components/ui/Lead';
import { Reveal } from '@/components/motion/Reveal';
import styles from './Cta.module.css';
import { PhoneMockup } from './PhoneMockup';

export function Cta() {
  return (
    <section id="download" className={styles.cta}>
      <Container className={styles.inner}>
        <Reveal>
          <Eyebrow tone="light">One Vietnam. One vivivu.</Eyebrow>
          <h2>
            Carry the whole
            <br />
            country in your
            <br />
            pocket.
          </h2>
          <Lead tone="light">
            Open vivivu and make every place, plan and journey across Vietnam feel beautifully simple.
          </Lead>
          <ButtonGroup>
            <Button href="/app/discover" variant="white" withArrow>
              Start exploring
            </Button>
            <Button href="/app/register" variant="dark" withArrow>
              Create a free account
            </Button>
          </ButtonGroup>
        </Reveal>

        <Reveal>
          <PhoneMockup />
        </Reveal>
      </Container>
    </section>
  );
}
