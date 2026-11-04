import { Container } from '@/components/layout/Container';
import { MediaReveal } from '@/components/motion/MediaReveal';
import { Reveal } from '@/components/motion/Reveal';
import { RuledList } from '@/components/motion/RuledList';
import { TextReveal } from '@/components/motion/TextReveal';
import { Image } from '@/components/ui/Image';
import { Label } from '@/components/ui/Label';
import { IMAGES } from '@/data/images';
import { SERVICES } from '@/sections/Ecosystem/services';
import styles from './Explore.module.css';

/** The eight services as a numbered two-column list on forest green, beside a pair of photos. */
export function Explore() {
  return (
    <section id="explore" className={styles.explore} data-tone="dark">
      <Container className={styles.split}>
        <div className={styles.text}>
          <Label>One beautiful ecosystem</Label>
          <TextReveal
            as="h2"
            lines={[
              'Your whole Vietnam,',
              <>
                <em>connected.</em>
              </>,
            ]}
          />
          <Reveal as="p" className={styles.lead} delay={200}>
            Eight services that already know each other, so the ride, the table and the bill line up
            on their own.
          </Reveal>

          <RuledList
            className={styles.services}
            stagger={70}
            items={SERVICES.map((service, i) => (
              <div className={styles.service}>
                <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
              </div>
            ))}
          />
        </div>

        <div className={styles.media}>
          <MediaReveal parallax className={styles.main}>
            <Image image={IMAGES.danang} />
          </MediaReveal>
          <div className={styles.thumbWrap}>
            <MediaReveal className={styles.thumb} delay={350}>
              <Image image={IMAGES.hoian} />
            </MediaReveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
