import { Reveal } from '@/components/motion/Reveal';
import { ScrollCarousel } from '@/components/ui/ScrollCarousel';
import { Section } from '@/components/layout/Section';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { ServiceCard } from './ServiceCard';
import { SERVICES } from './services';

export function Ecosystem() {
  return (
    <Section>
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

      <Reveal>
        <ScrollCarousel
          label="vivivu services"
          items={SERVICES}
          getKey={(service) => service.title}
          renderItem={(service, index) => (
            <ServiceCard service={service} delay={(index % 3) * 90} />
          )}
        />
      </Reveal>
    </Section>
  );
}
