import { Eyebrow } from '@/components/ui/Eyebrow';
import { Reveal } from '@/components/motion/Reveal';
import { ScrubText } from '@/components/motion/ScrubText';
import { Section } from '@/components/layout/Section';

const STATEMENT =
  'Vietnam moves to a hundred rhythms a day. vivivu gathers the people, places and payments of a whole country into one calm, trusted app, so every moment feels closer than you think.';

export function Intro() {
  return (
    <Section>
      <Reveal>
        <Eyebrow>Why vivivu</Eyebrow>
      </Reveal>
      <ScrubText text={STATEMENT} />
    </Section>
  );
}
