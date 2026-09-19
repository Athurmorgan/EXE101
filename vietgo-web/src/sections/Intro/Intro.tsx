import { Eyebrow } from '@/components/ui/Eyebrow';
import { Reveal } from '@/components/ui/Reveal';
import { ScrubText } from '@/components/ui/ScrubText';
import { Section } from '@/components/ui/Section';

const STATEMENT =
  'Vietnam moves to a hundred rhythms a day. VietGo gathers the people, places and payments of a whole country into one calm, trusted app, so every moment feels closer than you think.';

export function Intro() {
  return (
    <Section>
      <Reveal>
        <Eyebrow>Why VietGo</Eyebrow>
      </Reveal>
      <ScrubText text={STATEMENT} />
    </Section>
  );
}
