import { useEffect, useState } from 'react';

/** Height of the line, from the top of the viewport, that the fixed header reads its tone at. */
const PROBE_Y = 46;

/**
 * True while a dark surface (an element marked `data-tone="dark"`: a photo, a forest panel) is what
 * shows under the fixed header, so the bar can switch to light text. Sections marked
 * `data-tone="light"` that slide over a pinned photo count as covering it.
 *
 * One observer watches a 1px band at the header's middle and only fires when a marked element
 * crosses it; the answer is then read from the topmost marked element at that line. No scroll
 * listener, no layout reads while scrolling.
 */
export function useNavTone(): boolean {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    let observer: IntersectionObserver | undefined;

    const read = () => {
      const surface = document
        .elementsFromPoint(window.innerWidth / 2, PROBE_Y)
        .map((el) => el.closest('[data-tone]'))
        .find(Boolean);
      setDark(surface?.getAttribute('data-tone') === 'dark');
    };

    const observe = () => {
      observer?.disconnect();
      observer = new IntersectionObserver(read, {
        rootMargin: `-${PROBE_Y}px 0px -${window.innerHeight - PROBE_Y - 1}px 0px`,
      });
      document.querySelectorAll('[data-tone]').forEach((el) => observer?.observe(el));
    };

    observe();
    window.addEventListener('resize', observe);
    return () => {
      window.removeEventListener('resize', observe);
      observer?.disconnect();
    };
  }, []);

  return dark;
}
