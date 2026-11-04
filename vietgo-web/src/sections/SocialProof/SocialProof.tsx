import { CountUp } from '@/components/motion/CountUp';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Image } from '@/components/ui/Image';
import { MediaReveal } from '@/components/motion/MediaReveal';
import { Reveal } from '@/components/motion/Reveal';
import { WordReveal } from '@/components/motion/WordReveal';
import { Section } from '@/components/layout/Section';
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

/** A member's words beside a framed night photo of Hội An, with the numbers counting up below. */
export function SocialProof() {
  return (
    <Section id="stories">
      <div className={styles.grid}>
        <MediaReveal parallax className={styles.frame}>
          <Image image={IMAGES.hoianNight} decorative className={styles.photo} />
        </MediaReveal>

        <div>
          <Reveal>
            <Eyebrow>Built with Vietnam</Eyebrow>
          </Reveal>

          <WordReveal
            as="blockquote"
            className={styles.quote}
            text="“It feels less like eight apps—and more like the city already knows what I need.”"
          />

          <Reveal as="p" delay={300} className={styles.author}>
            Trung Nguyễn · Creative director, Hồ Chí Minh City
          </Reveal>

          <div className={styles.stats}>
            {STATS.map(({ label, ...count }, index) => (
              <Reveal key={label} delay={400 + index * 120} className={styles.stat}>
                <CountUp {...count} />
                <span>{label}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
