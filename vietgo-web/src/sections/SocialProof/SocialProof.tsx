import { CountUp } from '@/components/ui/CountUp';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { ParallaxImage } from '@/components/ui/ParallaxImage';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { IMAGES } from '@/data/images';
import styles from './SocialProof.module.css';

interface Stat {
  end: number;
  suffix?: string;
  decimals?: number;
  label: string;
}

const STATS: readonly Stat[] = [
  { end: 12, suffix: 'M+', label: 'members' },
  { end: 63, label: 'provinces & cities' },
  { end: 4.8, suffix: ' ★', decimals: 1, label: 'app rating' },
];

export function SocialProof() {
  return (
    <Section
      tone="forest"
      backdrop={
        <>
          <ParallaxImage image={IMAGES.hoianNight} className={styles.photo} />
          <div className={styles.shade} />
        </>
      }
    >
      <Reveal>
        <Eyebrow tone="mint">Built with Vietnam</Eyebrow>
      </Reveal>

      <Reveal as="blockquote" className={styles.quote}>
        “It feels less like eight apps—and more like the city already knows what I need.”
      </Reveal>

      <Reveal as="p" className={styles.author}>
        Trung Nguyễn · Creative director, Hồ Chí Minh City
      </Reveal>

      <Reveal className={styles.stats}>
        {STATS.map(({ label, ...count }) => (
          <div key={label} className={styles.stat}>
            <CountUp {...count} />
            <span>{label}</span>
          </div>
        ))}
      </Reveal>
    </Section>
  );
}
