import { useEffect, useState } from 'react';

/**
 * True once the page is scrolled further than `getThreshold()` pixels.
 * State only changes when the answer flips, so scrolling does not re-render on every event.
 */
export function useScrolledPast(getThreshold: () => number): boolean {
  const [past, setPast] = useState(false);

  useEffect(() => {
    const update = () => setPast(window.scrollY > getThreshold());
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [getThreshold]);

  return past;
}
