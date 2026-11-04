import { useEffect, useRef } from 'react';

/**
 * Tracks the pointer over an element and exposes its position as `--px` / `--py` (-1 to 1) for CSS
 * to drive small parallax shifts. Updates are batched to one per frame and only happen while a
 * mouse is over the element, so scrolling never does any work here.
 */
export function usePointerTilt<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) {
      return;
    }

    let frame = 0;
    const set = (x: number, y: number) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        element.style.setProperty('--px', x.toFixed(3));
        element.style.setProperty('--py', y.toFixed(3));
      });
    };
    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        ((event.clientY - rect.top) / rect.height) * 2 - 1,
      );
    };
    const onLeave = () => set(0, 0);

    element.addEventListener('pointermove', onMove);
    element.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener('pointermove', onMove);
      element.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return ref;
}
