import { Reveal } from '@/components/motion/Reveal';
import { TextReveal } from '@/components/motion/TextReveal';
import { Button } from '@/components/ui/Button';
import styles from './AppCta.module.css';

const PHOTO = `${import.meta.env.BASE_URL}images/slide-sapa-1920.webp`;
const PHOTO_LARGE = `${import.meta.env.BASE_URL}images/slide-sapa-3840.webp`;

/** Closing call to action: an olive plate over a full-bleed rice-terrace photo. */
export function AppCta() {
  return (
    <section id="app" className={styles.cta} data-tone="dark">
      <img
        className={styles.photo}
        src={PHOTO}
        srcSet={`${PHOTO} 1920w, ${PHOTO_LARGE} 3840w`}
        sizes="100vw"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
      />

      <Reveal className={styles.plate}>
        <TextReveal
          as="h2"
          lines={[
            'Start your trip',
            <>
              <em>the local way</em>
            </>,
          ]}
        />
        <p>
          Download vivivu, save the places your friends love, and let the app handle rides, tables
          and payments.
        </p>
        <div className={styles.actions}>
          <Button href="/app/discover" variant="gold" withArrow>
            Open the app
          </Button>
          <Button href="#" variant="outline" leadingIcon="apple">
            App Store
          </Button>
          <Button href="#" variant="outline" leadingIcon="android">
            Google Play
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
