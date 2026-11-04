import { useEffect, useState } from 'react';
import { WheelMark } from '@/components/brand/WheelMark';
import { markPageReady } from '@/hooks/usePageReady';
import { cx } from '@/utils/cx';
import styles from './Preloader.module.css';

/** Never hold the page longer than this, even if a photo is slow. */
const MAX_WAIT_MS = 2600;
/** Lets the bar finish its run before the screen lifts. */
const MIN_SHOW_MS = 900;
const LIFT_MS = 900;

/**
 * Cream screen with a thin gold bar, like the reference's loader: it waits for the fonts and the
 * first hero photo, then lifts away like a sheet and lets the hero play its entrance.
 */
export function Preloader({ firstImage }: { firstImage: string }) {
  const [phase, setPhase] = useState<'loading' | 'lifting' | 'gone'>('loading');

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      markPageReady();
      setPhase('gone');
      return;
    }

    let cancelled = false;
    const started = performance.now();
    const image = new window.Image();
    const imageLoaded = new Promise<void>((resolve) => {
      image.onload = image.onerror = () => resolve();
      image.src = firstImage;
    });
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, MAX_WAIT_MS));
    let liftTimer = 0;

    void Promise.race([
      Promise.all([imageLoaded, document.fonts?.ready ?? Promise.resolve()]),
      timeout,
    ]).then(() => {
      const wait = Math.max(0, MIN_SHOW_MS - (performance.now() - started));
      setTimeout(() => {
        if (cancelled) return;
        setPhase('lifting');
        markPageReady();
        liftTimer = window.setTimeout(() => setPhase('gone'), LIFT_MS);
      }, wait);
    });

    return () => {
      cancelled = true;
      clearTimeout(liftTimer);
    };
  }, [firstImage]);

  if (phase === 'gone') return null;

  return (
    <div className={cx(styles.preloader, phase === 'lifting' && styles.lifting)} aria-hidden="true">
      <span className={styles.bar} />
      <div className={styles.mark}>
        <WheelMark className={styles.wheel} />
        <span>vivivu</span>
      </div>
    </div>
  );
}
