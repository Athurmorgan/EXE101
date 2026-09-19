import Lenis from 'lenis';
import { useEffect, type ReactNode } from 'react';
import { gsap, MOTION_OK, ScrollTrigger } from '@/lib/gsap';

/**
 * Enables inertial smooth scrolling (Lenis) and keeps GSAP ScrollTrigger in sync with it.
 * Skipped entirely when the user prefers reduced motion.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  // Photos and web fonts change layout height after first paint, so re-measure once they settle.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    void document.fonts?.ready.then(refresh);
    return () => window.removeEventListener('load', refresh);
  }, []);

  useEffect(() => {
    if (!window.matchMedia(MOTION_OK).matches) return;

    // A higher lerp means less trailing: 0.1 felt sluggish, 0.18 still smooths but responds quickly.
    const lenis = new Lenis({ lerp: 0.18, anchors: { offset: -72 } });
    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return children;
}
