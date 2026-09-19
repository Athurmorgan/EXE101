import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { DESKTOP, gsap, MOTION_OK, useGSAP } from '@/lib/gsap';
import styles from './StackedSection.module.css';

interface StackedSectionProps {
  /** Anchor id for in-page links. It sits on an unstuck marker so links keep working while covered. */
  id?: string;
  /** Stacking order: a higher layer slides over lower ones. */
  layer: number;
  /** Round the top corners, hinting at the panel underneath. Off for the first panel. */
  rounded?: boolean;
  children: ReactNode;
}

/**
 * Wide screens only: the panel sticks to the top of the viewport while the next section slides
 * over it. The covered panel shrinks and darkens slightly as it goes. On small screens or with
 * reduced motion the panels simply follow one another.
 */
export function StackedSection({ id, layer, rounded = true, children }: StackedSectionProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);

  // A panel taller than the screen must scroll through before it sticks, so its sticky offset
  // is negative: the panel pins once its bottom edge reaches the bottom of the viewport.
  useEffect(() => {
    const panel = panelRef.current;
    const inner = innerRef.current;
    if (!panel || !inner) return;

    const update = () => {
      const offset = Math.min(0, window.innerHeight - inner.offsetHeight);
      panel.style.setProperty('--stack-top', `${offset}px`);
    };
    update();

    const observer = new ResizeObserver(update);
    observer.observe(inner);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  useGSAP(
    () => {
      const panel = panelRef.current;
      const inner = innerRef.current;
      const veil = veilRef.current;
      const next = panel?.nextElementSibling;
      if (!panel || !inner || !veil || !next) return;

      const mm = gsap.matchMedia();
      mm.add(`${MOTION_OK} and ${DESKTOP}`, () => {
        const scrollTrigger = { trigger: next, start: 'top bottom', end: 'top top', scrub: true };
        gsap.to(inner, { scale: 0.95, ease: 'none', scrollTrigger });
        gsap.to(veil, { opacity: 0.55, ease: 'none', scrollTrigger });
      });

      return () => mm.revert();
    },
    { scope: panelRef },
  );

  return (
    <>
      {id && <div id={id} className={styles.anchor} />}
      <div
        ref={panelRef}
        className={styles.panel}
        style={{ '--stack-layer': layer } as CSSProperties}
      >
        <div ref={innerRef} className={rounded ? styles.rounded : styles.flat}>
          {children}
        </div>
        <div ref={veilRef} className={styles.veil} aria-hidden="true" />
      </div>
    </>
  );
}
