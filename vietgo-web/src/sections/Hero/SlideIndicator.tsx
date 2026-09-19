import type { CSSProperties } from 'react';
import { cx } from '@/utils/cx';
import styles from './SlideIndicator.module.css';
import { SLIDE_INTERVAL_MS, SLIDES } from './slides';

const pad = (value: number) => String(value).padStart(2, '0');

interface SlideIndicatorProps {
  activeIndex: number;
  /** Whether the slideshow is cycling; segments only animate while it is. */
  playing: boolean;
}

/** Counter, place name and one progress segment per photo. */
export function SlideIndicator({ activeIndex, playing }: SlideIndicatorProps) {
  const current = SLIDES[activeIndex];

  return (
    <div className={styles.indicator}>
      <p className={styles.caption} aria-live="off">
        <span className={styles.count}>
          {pad(activeIndex + 1)} / {pad(SLIDES.length)}
        </span>
        {current?.place}
      </p>
      <ol className={styles.segments} aria-hidden="true">
        {SLIDES.map(({ place }, index) => (
          <li
            key={place}
            className={cx(
              styles.segment,
              index < activeIndex && styles.done,
              index === activeIndex && playing && styles.running,
            )}
            style={{ '--slide-duration': `${SLIDE_INTERVAL_MS}ms` } as CSSProperties}
          />
        ))}
      </ol>
    </div>
  );
}
