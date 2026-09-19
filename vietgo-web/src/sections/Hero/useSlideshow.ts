import { useEffect, useState } from 'react';
import { MOTION_OK } from '@/lib/gsap';
import { preloadSlides, SLIDE_INTERVAL_MS, type Slide } from './slides';

/**
 * Drives the hero slideshow.
 * - The first photo is shown immediately; the rest are downloaded when the browser is idle.
 * - Cycling starts only after every photo is cached, pauses while the tab is hidden or while
 *   `paused` is true (hero scrolled out of sight), and never starts for users who prefer
 *   reduced motion. Pausing offscreen saves the GPU for the rest of the page.
 */
export function useSlideshow(slides: readonly Slide[], paused = false) {
  // `previous` is the photo being covered by the active one; it is null until the first change.
  const [{ index, previous }, setPosition] = useState<{ index: number; previous: number | null }>({
    index: 0,
    previous: null,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      void preloadSlides(slides).then(() => {
        if (!cancelled) setReady(true);
      });
    };

    // Safari lacks requestIdleCallback, so fall back to a short timer there.
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(load, { timeout: 2000 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }
    const timer = window.setTimeout(load, 1200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [slides]);

  useEffect(() => {
    if (!ready || paused || !window.matchMedia(MOTION_OK).matches) return;

    let timer = 0;
    const start = () => {
      timer = window.setInterval(
        () =>
          setPosition((current) => ({
            index: (current.index + 1) % slides.length,
            previous: current.index,
          })),
        SLIDE_INTERVAL_MS,
      );
    };
    const stop = () => window.clearInterval(timer);
    const onVisibilityChange = () => {
      stop();
      if (!document.hidden) start();
    };

    start();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [ready, paused, slides.length]);

  return { index, previous, ready } as const;
}
