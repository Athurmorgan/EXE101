import { MediaReveal } from '@/components/motion/MediaReveal';
import { StackRun } from '@/components/motion/StackRun';
import { ScrollCarousel } from '@/components/ui/ScrollCarousel';
import { Section } from '@/components/layout/Section';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { ServiceCard } from './ServiceCard';
import { SERVICES } from './services';

const STACK = SERVICES.map(({ title, description, image }) => ({
  key: title,
  image,
  title,
  caption: description,
}));

export function Ecosystem() {
  return (
    <Section id="explore">
      <SectionHeader
        split
        eyebrow="One beautiful ecosystem"
        title={
          <>
            Your whole Vietnam,
            <br />
            connected.
          </>
        }
        lead="Eight everyday experiences share one identity, one trusted wallet and one understanding of where you are."
      />

      <StackRun items={STACK}>
        <ScrollCarousel
          label="vivivu services"
          items={SERVICES}
          getKey={(service) => service.title}
          renderItem={(service, index) => (
            <MediaReveal delay={Math.min(index, 4) * 90}>
              <ServiceCard service={service} />
            </MediaReveal>
          )}
        />
      </StackRun>
    </Section>
  );
}
