import { Reveal } from '@/components/ui/Reveal';
import { ScrollCarousel } from '@/components/ui/ScrollCarousel';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
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
          label="VietGo services"
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
