import { useRef, type ReactNode } from 'react';
import { gsap, MOTION_OK, useGSAP } from '@/lib/gsap';
import { cx } from '@/utils/cx';
import styles from './ParallaxLayer.module.css';

interface ParallaxLayerProps {
  children: ReactNode;
  /** Travel distance in % of the layer height (keep at or below 12). */
  speed?: number;
  /** Start moving from scroll position 0 (for a hero at the top of the page). */
  fromTop?: boolean;
  className?: string;
}

/** Wraps visual content so it drifts slower than the page while scrolling, creating depth. */
export function ParallaxLayer({
  children,
  speed = 10,
  fromTop = false,
  className,
}: ParallaxLayerProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const frame = frameRef.current;
      const layer = layerRef.current;
      if (!frame || !layer) return;

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          layer,
          { yPercent: fromTop ? 0 : -speed, scale: 1.25 },
          {
            yPercent: speed,
            scale: 1.25,
            ease: 'none',
            scrollTrigger: {
              trigger: frame,
              start: fromTop ? 'top top' : 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        );
      });

      return () => mm.revert();
    },
    { scope: frameRef },
  );

  return (
    <div ref={frameRef} className={cx(styles.frame, className)}>
      <div ref={layerRef} className={styles.layer}>
        {children}
      </div>
    </div>
  );
}
