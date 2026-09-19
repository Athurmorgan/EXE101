import type { IconName } from '@/components/ui/Icon';
import { IconBadge } from '@/components/ui/IconBadge';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import styles from './Trust.module.css';

interface Guarantee {
  title: string;
  description: string;
  icon: IconName;
}

const GUARANTEES: readonly Guarantee[] = [
  {
    title: 'Verified by VietGo',
    description: 'Drivers, stays and merchants pass ongoing reviews.',
    icon: 'shield',
  },
  {
    title: 'Private by design',
    description: 'You choose what is shared, and with whom.',
    icon: 'lock',
  },
  {
    title: 'Here, 24/7',
    description: 'Vietnamese and English support whenever you need it.',
    icon: 'headset',
  },
];

export function Trust() {
  return (
    <Section>
      <SectionHeader
        split
        eyebrow="Trust is the infrastructure"
        title="Protected at every turn."
        lead="Verified partners, encrypted payments and real people ready to help—24 hours a day."
        leadTone="green"
      />

      <div className={styles.grid}>
        {GUARANTEES.map(({ title, description, icon }, index) => (
          <Reveal key={title} as="article" delay={index * 70} className={styles.card}>
            <IconBadge name={icon} />
            <div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
