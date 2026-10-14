import type { ReactNode } from 'react';
import { useInView } from '@/hooks/useInView';
import { cx } from '@/utils/cx';
import styles from './CurtainReveal.module.css';

interface CurtainRevealProps {
  children: ReactNode;
  /** Transition delay in ms, handy for staggering neighbours. */
  delay?: number;
  /** Applied to the outer element (use it for positioning). */
  className?: string;
}

/**
 * Reveals a photo like a curtain being drawn up: the frame opens from the bottom while the
 * photo inside settles from a slight zoom. Triggers once, when it first scrolls into view.
 *
 * The outer element is what gets observed; the clipped frame is a child, because an element
 * clipped to nothing can never count as visible.
 */
export function CurtainReveal({ children, delay = 0, className }: CurtainRevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 });

  return (
    <div
      ref={ref}
      className={cx(styles.root, inView && styles.visible, className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      <div className={styles.frame} style={{ transitionDelay: `${delay}ms` }}>
        <div className={styles.inner} style={{ transitionDelay: `${delay}ms` }}>
          {children}
        </div>
      </div>
    </div>
  );
}
