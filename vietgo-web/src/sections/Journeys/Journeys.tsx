import { Container } from '@/components/layout/Container';
import { MediaReveal } from '@/components/motion/MediaReveal';
import { RuledList } from '@/components/motion/RuledList';
import { TextReveal } from '@/components/motion/TextReveal';
import { Icon } from '@/components/ui/Icon';
import { Image } from '@/components/ui/Image';
import { Label } from '@/components/ui/Label';
import { IMAGES } from '@/data/images';
import styles from './Journeys.module.css';

const TRAVELLERS = [
  'First-timers who want Vietnam without the guesswork',
  'Friends and families planning a trip together',
  'Couples looking for quiet, local evenings',
  'Remote workers staying a month, not a weekend',
  'Locals showing their city to visitors',
];

/** Who the app is for: an olive panel with a ruled list beside an offset market photo. */
export function Journeys() {
  return (
    <section id="journeys" className={styles.journeys}>
      <Container>
        <div className={styles.head}>
          <Label>Made for real days</Label>
          <TextReveal
            as="h2"
            lines={[
              'Who travels',
              <>
                <em>with vivivu</em>
              </>,
            ]}
          />
        </div>

        <div className={styles.split}>
          <div className={styles.panel}>
            <RuledList
              className={styles.list}
              itemClassName={styles.row}
              items={TRAVELLERS.map((who, i) => (
                <a href="/app/discover" className={styles.item}>
                  <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={styles.text}>{who}</span>
                  <Icon name="arrow" size={18} className={styles.arrow} />
                </a>
              ))}
            />
          </div>

          <MediaReveal parallax className={styles.photo} delay={200}>
            <Image image={IMAGES.hanoiMarket} />
          </MediaReveal>
        </div>
      </Container>
    </section>
  );
}
