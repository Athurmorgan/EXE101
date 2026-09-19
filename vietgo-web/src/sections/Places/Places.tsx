import { useState } from 'react';
import { CurtainReveal } from '@/components/ui/CurtainReveal';
import { Icon } from '@/components/ui/Icon';
import { Image } from '@/components/ui/Image';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { cx } from '@/utils/cx';
import { DESTINATIONS } from './destinations';
import styles from './Places.module.css';

export function Places() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <Section>
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

      <Reveal>
        <ul className={styles.panels}>
          {DESTINATIONS.map(({ name, tagline, description, image }, index) => (
            <li
              key={name}
              className={cx(styles.panel, index === activeIndex && styles.active)}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
            >
              <a href="#download" className={styles.link}>
                <CurtainReveal delay={index * 110} className={styles.photoFrame}>
                  <Image image={image} decorative className={styles.photo} />
                </CurtainReveal>
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
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
