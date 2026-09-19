import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useDragScroll } from '@/hooks/useDragScroll';
import { Icon } from './Icon';
import styles from './ScrollCarousel.module.css';

interface ScrollCarouselProps<T> {
  /** Accessible name for the carousel region. */
  label: string;
  items: readonly T[];
  getKey: (item: T) => string;
  renderItem: (item: T, index: number) => ReactNode;
}

const SLIDE_GAP_PX = 24;

/** Horizontally scrolling, snap-aligned list with drag, arrow buttons and a progress bar. */
export function ScrollCarousel<T>({ label, items, getKey, renderItem }: ScrollCarouselProps<T>) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [progress, setProgress] = useState(0);
  useDragScroll(trackRef);

  const updateProgress = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    setProgress(maxScroll > 0 ? track.scrollLeft / maxScroll : 0);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    updateProgress();
    track.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    return () => {
      track.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [updateProgress]);

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.firstElementChild as HTMLElement | null;
    const step = (slide?.offsetWidth ?? 320) + SLIDE_GAP_PX;
    track.scrollBy({ left: direction * step, behavior: 'smooth' });
  };

  return (
    <div
      className={styles.carousel}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <ul ref={trackRef} className={styles.track}>
        {items.map((item, index) => (
          <li key={getKey(item)} className={styles.slide}>
            {renderItem(item, index)}
          </li>
        ))}
      </ul>

      <div className={styles.controls}>
        <div className={styles.progress} aria-hidden="true">
          <span style={{ transform: `scaleX(${0.15 + progress * 0.85})` }} />
        </div>
        <div className={styles.buttons}>
          <button
            type="button"
            aria-label="Previous"
            disabled={progress <= 0.01}
            onClick={() => scrollByCard(-1)}
          >
            <Icon name="arrow" size={18} className={styles.prev} />
          </button>
          <button
            type="button"
            aria-label="Next"
            disabled={progress >= 0.99}
            onClick={() => scrollByCard(1)}
          >
            <Icon name="arrow" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
