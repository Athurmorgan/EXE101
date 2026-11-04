import { useRef, useState, type KeyboardEvent } from 'react';
import { Container } from '@/components/layout/Container';
import { Reveal } from '@/components/motion/Reveal';
import { TextReveal } from '@/components/motion/TextReveal';
import { Button } from '@/components/ui/Button';
import { Image } from '@/components/ui/Image';
import { IMAGES, type ImageAsset } from '@/data/images';
import { DESTINATIONS } from '@/sections/Places/destinations';
import { cx } from '@/utils/cx';
import styles from './Destinations.module.css';

/** Card details per destination, in the same order as `DESTINATIONS`. */
const DETAILS: readonly { meta: [string, string]; image?: ImageAsset }[] = [
  { meta: ['Old Quarter · lakes · street food', 'Best for 3–4 days'] },
  { meta: ['Cruises · kayaks · islands', 'Best for 2 days'] },
  { meta: ['Beaches · bridges · hills', 'Best for 3 days'] },
  { meta: ['Tailors · river · lanterns', 'Best for 2–3 days'], image: IMAGES.hoianNight },
  { meta: ['Rooftops · markets · noodles', 'Best for 3–4 days'] },
];

/**
 * Bordered tabs over a split card. Switching tabs wipes the new photo in over the old one and
 * lifts the new copy in, so the change reads as a page turning rather than a cut.
 */
export function Destinations() {
  const [active, setActive] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const place = DESTINATIONS[active] ?? DESTINATIONS[0]!;
  const details = DETAILS[active] ?? DETAILS[0]!;

  const select = (index: number) => {
    if (index === active) return;
    setPrevious(active);
    setActive(index);
  };

  // Arrow keys move between tabs, as in the WAI-ARIA tabs pattern.
  const onKeyDown = (event: KeyboardEvent) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (active + step + DESTINATIONS.length) % DESTINATIONS.length;
    select(next);
    tabs.current[next]?.focus();
  };

  return (
    <section id="places" className={styles.places}>
      <Container>
        <TextReveal
          as="h2"
          className={styles.title}
          lines={[
            <>
              Vietnam, <em>through</em>
            </>,
            'local eyes',
          ]}
        />

        <Reveal>
          <div className={styles.tabs} role="tablist" aria-label="Destinations">
            {DESTINATIONS.map((item, i) => (
              <button
                key={item.name}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`place-tab-${i}`}
                aria-selected={i === active}
                aria-controls="place-panel"
                tabIndex={i === active ? 0 : -1}
                className={cx(styles.tab, i === active && styles.tabActive)}
                onClick={() => select(i)}
                onKeyDown={onKeyDown}
              >
                {item.name}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div
            id="place-panel"
            role="tabpanel"
            aria-labelledby={`place-tab-${active}`}
            className={styles.card}
          >
            <div className={styles.info}>
              <div key={active} className={styles.infoInner}>
                <h3>{place.name}</h3>
                <p className={styles.tagline}>{place.tagline}</p>
                <ul className={styles.meta}>
                  {details.meta.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <p className={styles.description}>{place.description}</p>
                <Button href="/app/discover" variant="gold" size="sm" withArrow>
                  Explore {place.name}
                </Button>
              </div>
            </div>

            <div className={styles.photos}>
              {DESTINATIONS.map((item, i) => (
                <div
                  key={item.name}
                  className={cx(
                    styles.photo,
                    i === active && styles.photoActive,
                    i === previous && styles.photoPrevious,
                  )}
                >
                  <Image image={DETAILS[i]?.image ?? item.image} decorative={i !== active} />
                </div>
              ))}
              <span className={styles.counter} aria-hidden="true">
                {String(active + 1).padStart(2, '0')} /{' '}
                {String(DESTINATIONS.length).padStart(2, '0')}
              </span>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
