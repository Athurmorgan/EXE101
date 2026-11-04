import { Container } from '@/components/layout/Container';
import { RuledList } from '@/components/motion/RuledList';
import { TextReveal } from '@/components/motion/TextReveal';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Label } from '@/components/ui/Label';
import styles from './Safety.module.css';

const PROMISES: readonly { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'shield',
    title: 'Verified by vivivu',
    text: 'Drivers, stays and merchants pass ongoing reviews.',
  },
  { icon: 'lock', title: 'Private by design', text: 'You choose what is shared, and with whom.' },
  {
    icon: 'headset',
    title: 'Here, 24/7',
    text: 'Vietnamese and English support whenever you need it.',
  },
];

/** Three promises under ruled tops that draw in one after another. */
export function Safety() {
  return (
    <section id="safety" className={styles.safety}>
      <Container>
        <div className={styles.head}>
          <Label>Trust is the infrastructure</Label>
          <TextReveal
            as="h2"
            lines={[
              'Safe enough',
              <>
                <em>to forget about it</em>
              </>,
            ]}
          />
        </div>

        <RuledList
          className={styles.columns}
          stagger={140}
          items={PROMISES.map(({ icon, title, text }) => (
            <div className={styles.promise}>
              <Icon name={icon} size={28} className={styles.icon} />
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        />
      </Container>
    </section>
  );
}
