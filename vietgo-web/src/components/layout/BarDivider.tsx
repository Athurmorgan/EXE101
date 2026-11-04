import type { CSSProperties } from 'react';
import { useInView } from '@/hooks/useInView';
import { cx } from '@/utils/cx';
import styles from './BarDivider.module.css';

const BAR_COUNT = 72;

/**
 * Spike heights (0–1) from a fixed wave that climbs toward the right, so every render matches.
 * Two out-of-step sines keep neighbouring spikes uneven, like a hand-cut fence.
 */
const HEIGHTS = Array.from({ length: BAR_COUNT }, (_, index) => {
  const t = index / (BAR_COUNT - 1);
  const wave = 0.5 + 0.5 * Math.sin(index * 1.7) * Math.sin(index * 0.37 + 1);
  return Math.min(1, 0.18 + t * 0.55 + wave * 0.3);
});

interface BarDividerProps {
  /** Point the spikes down, for the top edge of a section. */
  flip?: boolean;
  className?: string;
}

/** A row of thin spikes that grow up once when the band scrolls into view. Purely decorative. */
export function BarDivider({ flip = false, className }: BarDividerProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.4 });

  return (
    <div
      ref={ref}
      className={cx(styles.divider, flip && styles.flip, inView && styles.visible, className)}
      aria-hidden="true"
    >
      {HEIGHTS.map((height, index) => (
        <span
          key={index}
          style={{ '--h': height, transitionDelay: `${index * 10}ms` } as CSSProperties}
        />
      ))}
    </div>
  );
}
