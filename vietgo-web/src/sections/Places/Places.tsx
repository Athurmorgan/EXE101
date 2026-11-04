import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Image } from '@/components/ui/Image';
import { MediaReveal } from '@/components/motion/MediaReveal';
import { StackRun } from '@/components/motion/StackRun';
import { Section } from '@/components/layout/Section';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { cx } from '@/utils/cx';
import { DESTINATIONS } from './destinations';
import styles from './Places.module.css';

const STACK = DESTINATIONS.map(({ name, tagline, image }) => ({
  key: name,
  image,
  title: name,
  caption: tagline,
}));

export function Places() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <Section id="places">
      <SectionHeader
        eyebrow="Closer to every place"
        title={
          <>
            Vietnam, through local
            <br />
            eyes.
          </>
        }
        lead="Not a checklist. Living guides shaped by the people who call each place home."
        leadTone="green"
      />

      <StackRun items={STACK}>
        <ul className={styles.panels}>
          {DESTINATIONS.map(({ name, tagline, description, image }, index) => (
            <li
              key={name}
              className={cx(styles.panel, index === activeIndex && styles.active)}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
            >
              <MediaReveal delay={index * 90} className={styles.reveal}>
                <a href="/app/discover" className={styles.link}>
                  <Image image={image} decorative className={styles.photo} />
                  <div className={styles.shade} />
                  <div className={styles.content}>
                    <h3>{name}</h3>
                    <div className={styles.details}>
                      <p className={styles.tagline}>
                        {tagline} <Icon name="arrow" />
                      </p>
                      <p>{description}</p>
                    </div>
                  </div>
                </a>
              </MediaReveal>
            </li>
          ))}
        </ul>
      </StackRun>
    </Section>
  );
}
