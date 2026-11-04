import type { CSSProperties, ElementType, ReactNode } from 'react';
import { useInView } from '@/hooks/useInView';
import { cx } from '@/utils/cx';
import styles from './MediaReveal.module.css';

interface MediaRevealProps {
  as?: ElementType;
  /** Transition delay in ms, for staggering a row of images. */
  delay?: number;
  /** Lets the framed photo drift slower than the page as it passes through the viewport. */
  parallax?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Wipes a photo up into view the first time it is seen: the frame opens from the bottom while the
 * image inside settles from a slight zoom. Runs once, on clip-path and transform only. The clip sits
 * on an inner layer: a fully clipped element never reports as intersecting, so it is not observed.
 */
export function MediaReveal({
  as: Tag = 'div',
  delay = 0,
  parallax = false,
  className,
  children,
}: MediaRevealProps) {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.2 });

  return (
    <Tag
      ref={ref}
      className={cx(parallax && styles.parallax, inView && styles.visible, className)}
      style={delay ? ({ '--delay': `${delay}ms` } as CSSProperties) : undefined}
    >
      <div className={styles.media}>{children}</div>
    </Tag>
  );
}
