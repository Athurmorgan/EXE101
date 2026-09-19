import { Button } from '@/components/ui/Button';
import { ButtonGroup } from '@/components/ui/ButtonGroup';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Lead } from '@/components/ui/Lead';
import { Reveal } from '@/components/ui/Reveal';
import styles from './Cta.module.css';
import { PhoneMockup } from './PhoneMockup';

export function Cta() {
  return (
    <section id="download" className={styles.cta}>
      <Container className={styles.inner}>
        <Reveal>
          <Eyebrow tone="light">One Vietnam. One VietGo.</Eyebrow>
          <h2>
            Carry the whole
            <br />
            country in your
            <br />
            pocket.
          </h2>
          <Lead tone="light">
            Download VietGo and make every connection, journey and payment feel beautifully simple.
          </Lead>
          <ButtonGroup>
            <Button href="#" variant="white" leadingIcon="apple" withArrow>
              Download for iOS
            </Button>
            <Button href="#" variant="dark" leadingIcon="android" withArrow>
              Get it on Android
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
