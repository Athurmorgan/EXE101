import { Eyebrow } from '@/components/ui/Eyebrow';
import { Reveal } from '@/components/motion/Reveal';
import { WordReveal } from '@/components/motion/WordReveal';
import { Section } from '@/components/layout/Section';
import styles from './Intro.module.css';

export function Intro() {
  return (
    <Section>
      <Reveal>
        <Eyebrow>Why vivivu</Eyebrow>
      </Reveal>
      <WordReveal
        className={styles.statement}
        text="Vietnam moves to a hundred rhythms a day. vivivu gathers the people, places and payments of a whole country into one calm, trusted app,"
        softText="so every moment feels closer than you think."
      />
    </Section>
  );
}
