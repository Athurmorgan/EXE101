import { useEffect, type ReactNode } from 'react';
import { ScrollTrigger } from '@/lib/gsap';

/**
 * Keeps GSAP ScrollTrigger measurements fresh on the landing page. Scrolling itself is native:
 * the old Lenis smooth-scroll layer re-ran every scroll-linked animation on each frame and made
 * the page feel heavy, so in-page links rely on CSS `scroll-behavior` instead.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  // Photos and web fonts change layout height after first paint, so re-measure once they settle.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    void document.fonts?.ready.then(refresh);
    return () => window.removeEventListener('load', refresh);
  }, []);

  return children;
}
